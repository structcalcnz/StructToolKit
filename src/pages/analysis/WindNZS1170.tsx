import { useEffect } from 'react';
import { useBoundStore } from '@/stores/useBoundStore';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

// Reusable group for displaying a set of factors
const FactorDisplayGroup = ({ title, factors }: { title: string, factors: {label: string, value?: number}[] }) => (
    <div className="p-4 border rounded-md bg-muted/30">
        <h4 className="font-semibold mb-2 text-sm">{title}</h4>
        <div className="grid grid-cols-2 gap-2">
            {factors.map(f => (
                <div key={f.label} className="space-y-1">
                    <Label className="text-xs text-muted-foreground">{f.label}</Label>
                    <Input value={f.value?.toFixed(3) ?? '...'} readOnly disabled />
                </div>
            ))}
        </div>
    </div>
);

export function WindNZS1170() {
  const { windInputs, windCalculatedFactors } = useBoundStore();
  const { updateWindInput, calculateWindFactors } = useBoundStore(state => state.actions);

  // Auto-recalculate when relevant inputs change
  useEffect(() => {
    calculateWindFactors();
  }, [windInputs.v_ns, windInputs.v_ew, windInputs.alpha, calculateWindFactors]);

  const f = windCalculatedFactors;

  return (
    <div className="space-y-3">
        <div className='border p-3 rounded-md'>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="space-y-1">
                <Label>Roof Slope, α (°)</Label>
                <Input type="number" value={windInputs.alpha} onChange={e => updateWindInput('alpha', parseFloat(e.target.value) || 0)} />
            </div>
        </div>
        </div>
      {/* --- N-S Direction --- */}
      <div className="space-y-4">
        <h3 className="font-bold text-lg">N-S Direction</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1">
            <Label>Site Wind Speed, V (m/s)</Label>
            <Input type="number" value={windInputs.v_ns} onChange={e => updateWindInput('v_ns', parseFloat(e.target.value))} />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FactorDisplayGroup title="Calculated Factors (N-S)" factors={[
                { label: 'd/b', value: f.db_ns }, { label: 'h/d', value: f.hd_ns },
                { label: 'Cpw,L', value: f.cpwl_ns }, { label: 'Cpr', value: f.cpr_ns }
            ]}/>
            <FactorDisplayGroup title="Pressures (N-S)" factors={[
                { label: 'Roof Pressure, pr (kPa)', value: f.pr_ns },
                { label: 'Wall Pressure, pw (kPa)', value: f.pw_ns }
                
            ]}/>
        </div>
      </div>

      <Separator />

      {/* --- E-W Direction --- */}
      <div className="space-y-4">
        <h3 className="font-bold text-lg">E-W Direction</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1">
            <Label>Site Wind Speed, V (m/s)</Label>
            <Input type="number" value={windInputs.v_ew} onChange={e => updateWindInput('v_ew', parseFloat(e.target.value))} />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <FactorDisplayGroup title="Calculated Factors (E-W)" factors={[
                { label: 'd/b', value: f.db_ew }, { label: 'h/d', value: f.hd_ew },
                { label: 'Cpw,L', value: f.cpwl_ew }, { label: 'Cpr', value: f.cpr_ew }
            ]}/>
            <FactorDisplayGroup title="Pressures (E-W)" factors={[
                { label: 'Roof Pressure, pr (kPa)', value: f.pr_ew },
                { label: 'Wall Pressure, pw (kPa)', value: f.pw_ew }                
            ]}/>
        </div>
      </div>
    </div>
  );
}