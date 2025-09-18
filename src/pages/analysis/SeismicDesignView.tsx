import { useBoundStore } from '@/stores/useBoundStore';
import lookups from '@/data/seismicLookups.json';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

// Reusable input group component
const InputGroup = ({ label, children }: {label: string, children: React.ReactNode}) => (
    <div className="space-y-1">
        <Label className="text-sm">{label}</Label>
        {children}
    </div>
);

//component to display the calculated factors
const CalculatedFactorsCard = () => {
    const factors = useBoundStore(state => state.seismicCalculatedFactors);
    if (factors.Cht === 0) return null; // Don't show if not calculated

    return (
        <Card>
            <CardHeader><CardTitle>Calculated Factors</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-3 md:grid-cols-6 gap-4 text-sm">
                <div className="flex flex-col items-center justify-center space-y-1"><Label className="text-muted-foreground">Ch(T)</Label><p>{factors.Cht.toFixed(2)}</p></div>
                <div className="flex flex-col items-center justify-center space-y-1"><Label className="text-muted-foreground">Ru</Label><p>{factors.Ru.toFixed(2)}</p></div>
                <div className="flex flex-col items-center justify-center space-y-1"><Label className="text-muted-foreground">C(T)</Label><p>{factors.CT.toFixed(2)}</p></div>
                <div className="flex flex-col items-center justify-center space-y-1"><Label className="text-muted-foreground">k_μ</Label><p>{factors.k_mu.toFixed(2)}</p></div>
                <div className="flex flex-col items-center justify-center space-y-1 font-bold"><Label className="text-muted-foreground">Cd(T1)_uls</Label><p>{factors.CdT1.toFixed(3)}</p></div>
                <div className="flex flex-col items-center justify-center space-y-1"><Label className="text-muted-foreground">Cd(T1)_sls</Label><p>{factors.CdT1_sls.toFixed(3)}</p></div>
            </CardContent>
        </Card>
    )
}

export function SeismicDesignView() {
    const { seismicDesignInputs, seismicActions, isActionResultsStale } = useBoundStore();
    const { updateSeismicDesignInput, calculateSeismicActions } = useBoundStore(state => state.actions);

    return (
        <div className="space-y-6">
            {/* Site Spectra */}
            <Card>
                <CardHeader><CardTitle>Site Spectra</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-4">
                    <InputGroup label="Subsoil Class">
                        <Select value={seismicDesignInputs.subsoilClass} onValueChange={(v) => updateSeismicDesignInput('subsoilClass', v)}>
                            <SelectTrigger><SelectValue/></SelectTrigger>
                            <SelectContent>{['A', 'B', 'C', 'D', 'E'].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                        </Select>
                    </InputGroup>
                    <InputGroup label="Period T1 (s)">
                         <Input type="number" step={0.1} value={seismicDesignInputs.t1} onChange={e => updateSeismicDesignInput('t1', parseFloat(e.target.value))} />
                    </InputGroup>
                    <InputGroup label="Importance Level">
                         <Select value={seismicDesignInputs.importanceLevel} onValueChange={(v) => updateSeismicDesignInput('importanceLevel', v)}>
                            <SelectTrigger><SelectValue/></SelectTrigger>
                            <SelectContent>{['1', '2', '3', '4'].map(c => <SelectItem key={c} value={c}>IL{c}</SelectItem>)}</SelectContent>
                        </Select>
                    </InputGroup>
                    <InputGroup label="Design Life">
                         <Select value={seismicDesignInputs.designLife} onValueChange={(v) => updateSeismicDesignInput('designLife', v)}>
                            <SelectTrigger><SelectValue/></SelectTrigger>
                            <SelectContent>{Object.keys(lookups.returnPeriods).map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                        </Select>
                    </InputGroup>
                    <InputGroup label="Town/Region">
                         <Select value={seismicDesignInputs.town} onValueChange={(v) => updateSeismicDesignInput('town', v)}>
                            <SelectTrigger><SelectValue/></SelectTrigger>
                            <SelectContent>{lookups.towns.map(c => <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>)}</SelectContent>
                        </Select>
                    </InputGroup>
                     <InputGroup label="Hazard Factor, Z">
                         <Input type="number" value={seismicDesignInputs.useCustomZ ? seismicDesignInputs.customZ : (lookups.towns.find(t=>t.name === seismicDesignInputs.town)?.z || 0)} onChange={e => updateSeismicDesignInput('customZ', parseFloat(e.target.value))} disabled={!seismicDesignInputs.useCustomZ}/>
                         <div className="flex items-center space-x-2 mt-2">
                            <Checkbox id="custom-z" checked={seismicDesignInputs.useCustomZ} onCheckedChange={(c) => updateSeismicDesignInput('useCustomZ', Boolean(c))} />
                            <Label htmlFor="custom-z" className="text-xs font-normal">Custom Z</Label>
                         </div>
                    </InputGroup>
                    <InputGroup label="Rs (SLS)">
                        <Input type="number" value={seismicDesignInputs.rs} onChange={e => updateSeismicDesignInput('rs', parseFloat(e.target.value))} />
                    </InputGroup>
                     <InputGroup label="Near Fault N(T,D)">
                        <Input type="number" value={seismicDesignInputs.nearFaultFactor.toFixed(2)} onChange={e => updateSeismicDesignInput('nearFaultFactor', parseFloat(e.target.value))} />
                    </InputGroup>
                </CardContent>
            </Card>

            {/* Seismic Coefficients */}
            <Card>
                <CardHeader><CardTitle>Seismic Coefficients</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-4">
                     <InputGroup label="Ductility μ">
                        <Input type="number" step={0.25} value={seismicDesignInputs.mu.toFixed(2)} onChange={e => updateSeismicDesignInput('mu', parseFloat(e.target.value))} />
                    </InputGroup>
                     <InputGroup label="Damping ζe">
                        <Input type="number" step={0.1} value={seismicDesignInputs.zeta.toFixed(2)} onChange={e => updateSeismicDesignInput('zeta', parseFloat(e.target.value))} />
                    </InputGroup>
                        {/* Derived results */}
                    <InputGroup label="Sp">
                    <Input
                        type="number"
                        value={
                        seismicDesignInputs.mu <= 2
                            ? (1.3 - 0.3 * seismicDesignInputs.mu).toFixed(2)
                            : '0.700'
                        }
                        disabled
                    />
                    </InputGroup>
                    <InputGroup label="Mζ">
                    <Input
                        type="number"
                        value={Math.sqrt(7 / (2 + seismicDesignInputs.zeta * 100)).toFixed(2)}
                        disabled
                    />
                    </InputGroup>
                </CardContent>
            </Card>

            <CalculatedFactorsCard />

             {/* Seismic Actions */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Seismic Actions</CardTitle>
                    <Button 
                        onClick={calculateSeismicActions}
                        variant={isActionResultsStale? "destructive" : "default"}
                        className={cn(isActionResultsStale && 'animate-pulse')}
                    >
                        {isActionResultsStale && seismicActions.length > 0 ? 'Recalculate Actions' : 'Calculate Actions'}
                    </Button>
                </CardHeader>
                <CardContent>
                    {/* conditional alert notice */}
                    {isActionResultsStale && seismicActions.length > 0 && (
                        <Alert variant="destructive" className="mb-4">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>Results are Outdated</AlertTitle>
                            <AlertDescription>
                                An input parameter has changed. Please recalculate to see the updated seismic actions.
                            </AlertDescription>
                        </Alert>
                    )}
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Level</TableHead>
                                <TableHead>DL (kN)</TableHead>
                                <TableHead>LL (kN)</TableHead>
                                <TableHead>h_i (m)</TableHead>
                                <TableHead>F_i (kN)</TableHead>
                                <TableHead>V_i (kN)</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {seismicActions.map(action => (
                                <TableRow key={action.levelId}>
                                    <TableCell>{action.levelName}</TableCell>
                                    <TableCell>{action.effectiveDL.toFixed(2)}</TableCell>
                                    <TableCell>{action.effectiveLL.toFixed(2)}</TableCell>
                                    <TableCell>{action.heightFromGround.toFixed(2)}</TableCell>
                                    <TableCell>{action.seismicForce.toFixed(2)}</TableCell>
                                    <TableCell className="text-amber-600 dark:text-blue-300 font-bold">{action.shear.toFixed(2)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}