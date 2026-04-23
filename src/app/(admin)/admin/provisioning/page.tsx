import { ProvisioningForm } from "@/components/admin/ProvisioningForm";

export default function ProvisioningPage() {
  return (
    <div className="space-y-12 pb-24">
      <header>
        <h2 className="text-4xl font-light tracking-tight text-white mb-2">System Provisioning</h2>
        <p className="text-neutral-500 font-light">Create and bootstrap new organizational boundaries.</p>
      </header>

      <div className="max-w-2xl">
        <ProvisioningForm />
      </div>
    </div>
  );
}
