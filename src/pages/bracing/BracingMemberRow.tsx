import { useBoundStore } from '@/stores/useBoundStore';
import type { BracingMember } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TableCell, TableRow } from '@/components/ui/table'; // Import TableCell and TableRow
import { Plus, Trash2 } from 'lucide-react';

interface BracingMemberRowProps {
  sectionId: string;
  lineId: string;
  member: BracingMember;
  index: number;
  totalMembers: number;
  calculated: {
    unitWind: number;
    unitEQ: number;
    totalWind: number;
    totalEQ: number;
  };
}

export function BracingMemberRow({ sectionId, lineId, member, index, totalMembers, calculated }: BracingMemberRowProps) {
  const { bracingSystems } = useBoundStore();
  const { addBracingMember, removeBracingMember, updateBracingMember } = useBoundStore(state => state.actions);

  const availableTypes = bracingSystems.find(s => s.name === member.system)?.types || [];

  return (
    <TableRow> 
      <TableCell className="py-2 px-2"> 
        <Input placeholder="Label" value={member.name} onChange={e => updateBracingMember(sectionId, lineId, member.id, { name: e.target.value })} />
      </TableCell>
      <TableCell className="py-2 px-2"> 
        <Select value={member.system} onValueChange={val => updateBracingMember(sectionId, lineId, member.id, { system: val })}>
          <SelectTrigger className="w-full"><SelectValue placeholder="System..." /></SelectTrigger>
          <SelectContent>{bracingSystems.map(s => <SelectItem key={s.name} value={s.name}>{s.name}</SelectItem>)}</SelectContent>
        </Select>
      </TableCell>
      <TableCell className="py-2 px-2"> 
        <Select value={member.type} onValueChange={val => updateBracingMember(sectionId, lineId, member.id, { type: val })}>
          <SelectTrigger className="w-full"><SelectValue placeholder="Type..." /></SelectTrigger>
          <SelectContent>{availableTypes.map(t => <SelectItem key={t.name} value={t.name}>{t.name}</SelectItem>)}</SelectContent>
        </Select>
      </TableCell>
      <TableCell className="py-2 px-2"> 
        <Input type="number" step="0.1" value={member.lengthOrCount} onChange={e => updateBracingMember(sectionId, lineId, member.id, { lengthOrCount: Number(e.target.value) })} />
      </TableCell>
      <TableCell className="py-2 px-2"> 
        <Input type="number" step="0.1" value={member.height} onChange={e => updateBracingMember(sectionId, lineId, member.id, { height: Number(e.target.value) })} />
      </TableCell>
      <TableCell className="py-2 px-2 text-center font-medium"> 
        {calculated.unitWind.toFixed(0)}
      </TableCell>
      <TableCell className="py-2 px-2 text-center font-medium"> 
        {calculated.unitEQ.toFixed(0)}
      </TableCell>
      <TableCell className="py-2 px-2 text-center font-semibold"> 
        {calculated.totalWind.toFixed(0)}
      </TableCell>
      <TableCell className="py-2 px-2 text-center font-semibold"> 
        {calculated.totalEQ.toFixed(0)}
      </TableCell>
      <TableCell className="py-2 px-2"> 
        <div className="flex gap-1">
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => addBracingMember(sectionId, lineId, index)}><Plus className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => removeBracingMember(sectionId, lineId, member.id)} disabled={totalMembers <= 1}><Trash2 className="h-4 w-4" /></Button>
        </div>
      </TableCell>
    </TableRow>
  );
}