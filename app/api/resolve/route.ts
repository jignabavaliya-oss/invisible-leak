import { NextResponse } from "next/server";
import { summarize } from "@/lib/leakDetection";

export const dynamic = "force-dynamic";

// POST { resource_id } → returns the recommended remediation command + a Terraform stub.
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const id = body?.resource_id as string | undefined;
  if (!id) return NextResponse.json({ error: "resource_id required" }, { status: 400 });

  for (const ws of await summarize()) {
    const leak = ws.leaks.find((l) => l.item.resource_id === id);
    if (leak) {
      return NextResponse.json({
        cli: leak.remediation,
        terraform: terraformFor(leak.item.kind, leak.item.resource_id),
        reason: leak.reason,
        monthly_savings_usd: leak.monthly_waste_usd,
      });
    }
  }
  return NextResponse.json({ error: "no leak for that resource" }, { status: 404 });
}

function terraformFor(kind: string, id: string) {
  switch (kind) {
    case "ebs_volume":
      return `# Remove from state and destroy\nterraform state rm 'aws_ebs_volume.${id}'\n# Or:\nresource "null_resource" "delete_${id}" { provisioner "local-exec" { command = "aws ec2 delete-volume --volume-id ${id}" } }`;
    case "load_balancer":
      return `terraform destroy -target='aws_lb.${id}'`;
    case "snapshot":
      return `# aws_ebs_snapshot resource — destroy via Terraform if managed, else CLI`;
    default:
      return `# No Terraform template for kind=${kind}; use CLI command above.`;
  }
}
