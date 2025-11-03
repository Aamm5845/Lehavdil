'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, GripVertical, Clock, Bus, BookOpen, Coffee, DoorOpen, Bell } from 'lucide-react';
import { toast } from 'sonner';
import type { TimeBlock, DayType, SubjectType } from '@/lib/types';

interface ScheduleBuilderProps {
  classId: string;
  dayType: DayType;
}

const SUBJECT_TYPES: { value: SubjectType; labelEn: string; labelHe: string; icon: any; color: string }[] = [
  { value: 'bus-start', labelEn: 'Bus Arrival', labelHe: 'הגעת אוטובוס', icon: Bus, color: 'bg-blue-500' },
  { value: 'class-start', labelEn: 'Class Starts', labelHe: 'תחילת שיעור', icon: Bell, color: 'bg-cyan-500' },
  { value: 'hebrew', labelEn: 'Hebrew Learning', labelHe: 'לימוד עברית', icon: BookOpen, color: 'bg-purple-500' },
  { value: 'english', labelEn: 'English Learning', labelHe: 'לימוד אנגלית', icon: BookOpen, color: 'bg-green-500' },
  { value: 'break', labelEn: 'Break', labelHe: 'הפסקה', icon: Coffee, color: 'bg-orange-500' },
  { value: 'end-day', labelEn: 'End of Day', labelHe: 'סיום יום', icon: DoorOpen, color: 'bg-red-500' },
  { value: 'other', labelEn: 'Other', labelHe: 'אחר', icon: Clock, color: 'bg-slate-500' },
];

export function ScheduleBuilder({ classId, dayType }: ScheduleBuilderProps) {
  const { lang } = useLanguage();
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchTimeBlocks();
  }, [classId, dayType]);

  const fetchTimeBlocks = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/time-blocks?classId=${classId}&dayType=${dayType}`);
      const data = await res.json();
      setTimeBlocks((data.timeBlocks || []).sort((a: TimeBlock, b: TimeBlock) => a.sortOrder - b.sortOrder));
    } catch (error) {
      toast.error(lang === 'en' ? 'Failed to load schedule' : 'כשלון בטעינת לוח זמנים');
    } finally {
      setLoading(false);
    }
  };

  const addTimeBlock = () => {
    // Smart time suggestion: if there are existing blocks, start where the last one ended
    let startTime = '08:00';
    let endTime = '09:00';
    
    if (timeBlocks.length > 0) {
      const lastBlock = timeBlocks[timeBlocks.length - 1];
      startTime = lastBlock.endTime;
      
      // Add 1 hour by default
      const [hours, minutes] = startTime.split(':').map(Number);
      const endHours = (hours + 1) % 24;
      endTime = `${String(endHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    }
    
    const newBlock: Partial<TimeBlock> = {
      classId,
      dayType,
      startTime,
      endTime,
      subjectType: 'hebrew',
      description: '',
      sortOrder: timeBlocks.length,
    };
    
    // Add to local state immediately
    setTimeBlocks([...timeBlocks, newBlock as TimeBlock]);
  };

  const updateTimeBlock = (index: number, field: keyof TimeBlock, value: any) => {
    const updated = [...timeBlocks];
    updated[index] = { ...updated[index], [field]: value };
    setTimeBlocks(updated);
  };

  const deleteTimeBlock = async (index: number) => {
    const block = timeBlocks[index];
    
    // If it has an ID, delete from server
    if (block.id) {
      try {
        await fetch(`/api/time-blocks/${block.id}`, { method: 'DELETE' });
        toast.success(lang === 'en' ? 'Time block deleted' : 'בלוק זמן נמחק');
      } catch (error) {
        toast.error(lang === 'en' ? 'Failed to delete' : 'כשלון במחיקה');
        return;
      }
    }
    
    // Remove from local state
    const updated = timeBlocks.filter((_, i) => i !== index);
    // Update sort order
    updated.forEach((block, i) => {
      block.sortOrder = i;
    });
    setTimeBlocks(updated);
  };

  const saveSchedule = async () => {
    try {
      setSaving(true);
      
      // Save each block
      for (const block of timeBlocks) {
        if (block.id) {
          // Update existing
          await fetch(`/api/time-blocks/${block.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              startTime: block.startTime,
              endTime: block.endTime,
              subjectType: block.subjectType,
              description: block.description,
              sortOrder: block.sortOrder,
            }),
          });
        } else {
          // Create new
          const res = await fetch('/api/time-blocks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              classId: block.classId,
              dayType: block.dayType,
              startTime: block.startTime,
              endTime: block.endTime,
              subjectType: block.subjectType,
              description: block.description,
              sortOrder: block.sortOrder,
            }),
          });
          const data = await res.json();
          // Update with returned ID
          block.id = data.timeBlock.id;
        }
      }
      
      toast.success(lang === 'en' ? 'Schedule saved successfully' : 'לוח זמנים נשמר בהצלחה');
      fetchTimeBlocks(); // Refresh to get updated data
    } catch (error) {
      toast.error(lang === 'en' ? 'Failed to save schedule' : 'כשלון בשמירת לוח זמנים');
    } finally {
      setSaving(false);
    }
  };

  const getSubjectInfo = (type: SubjectType) => {
    return SUBJECT_TYPES.find(s => s.value === type) || SUBJECT_TYPES[5];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Quick Add Templates */}
      {timeBlocks.length === 0 && (
        <div className="mb-6">
          <p className="text-sm font-medium text-slate-700 mb-3">
            {lang === 'en' ? 'Quick Start Templates:' : 'תבניות מהירות:'}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const template = [
                  { startTime: '08:00', endTime: '08:15', subjectType: 'bus-start' as SubjectType, description: '' },
                  { startTime: '08:15', endTime: '08:30', subjectType: 'class-start' as SubjectType, description: '' },
                  { startTime: '08:30', endTime: '10:30', subjectType: 'hebrew' as SubjectType, description: '' },
                  { startTime: '10:30', endTime: '10:45', subjectType: 'break' as SubjectType, description: '' },
                  { startTime: '10:45', endTime: '12:45', subjectType: 'english' as SubjectType, description: '' },
                  { startTime: '12:45', endTime: '13:00', subjectType: 'end-day' as SubjectType, description: '' },
                ];
                setTimeBlocks(template.map((t, i) => ({
                  ...t,
                  classId,
                  dayType,
                  sortOrder: i,
                } as TimeBlock)));
              }}
              className="gap-2"
            >
              <Clock className="w-4 h-4" />
              {lang === 'en' ? 'Full Day Template' : 'תבנית יום מלא'}
            </Button>
          </div>
        </div>
      )}

      {/* Time Blocks List */}
      <div className="space-y-3">
        {timeBlocks.map((block, index) => {
          const subjectInfo = getSubjectInfo(block.subjectType);
          const Icon = subjectInfo.icon;
          
          return (
            <Card key={index} className="border-slate-200">
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                  {/* Drag Handle */}
                  <div className="md:col-span-1 flex items-center justify-center pt-2">
                    <GripVertical className="w-5 h-5 text-slate-400 cursor-move" />
                  </div>
                  
                  {/* Subject Type */}
                  <div className="md:col-span-3 space-y-2">
                    <Label className="text-xs text-slate-600">
                      {lang === 'en' ? 'Subject' : 'נושא'}
                    </Label>
                    <Select 
                      value={block.subjectType} 
                      onValueChange={(value) => updateTimeBlock(index, 'subjectType', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SUBJECT_TYPES.map(subject => {
                          const SubIcon = subject.icon;
                          return (
                            <SelectItem key={subject.value} value={subject.value}>
                              <div className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded ${subject.color}`}></div>
                                {lang === 'en' ? subject.labelEn : subject.labelHe}
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Start Time */}
                  <div className="md:col-span-2 space-y-2">
                    <Label className="text-xs text-slate-600">
                      {lang === 'en' ? 'Start' : 'התחלה'}
                    </Label>
                    <Input
                      type="time"
                      value={block.startTime}
                      onChange={(e) => updateTimeBlock(index, 'startTime', e.target.value)}
                    />
                  </div>
                  
                  {/* End Time */}
                  <div className="md:col-span-2 space-y-2">
                    <Label className="text-xs text-slate-600">
                      {lang === 'en' ? 'End' : 'סיום'}
                    </Label>
                    <Input
                      type="time"
                      value={block.endTime}
                      onChange={(e) => updateTimeBlock(index, 'endTime', e.target.value)}
                    />
                  </div>
                  
                  {/* Description */}
                  <div className="md:col-span-3 space-y-2">
                    <Label className="text-xs text-slate-600">
                      {lang === 'en' ? 'Description' : 'תיאור'}
                    </Label>
                    <Input
                      placeholder={lang === 'en' ? 'Optional' : 'אופציונלי'}
                      value={block.description || ''}
                      onChange={(e) => updateTimeBlock(index, 'description', e.target.value)}
                    />
                  </div>
                  
                  {/* Delete Button */}
                  <div className="md:col-span-1 flex items-end justify-center pb-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteTimeBlock(index)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {timeBlocks.length === 0 && (
        <Card className="border-2 border-dashed border-slate-200">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Clock className="w-12 h-12 text-slate-400 mb-3" />
            <p className="text-slate-600 text-center">
              {lang === 'en' 
                ? 'No time blocks yet. Click "Add Time Block" to start building the schedule.' 
                : 'אין בלוקי זמן עדיין. לחץ על "הוסף בלוק זמן" כדי להתחיל לבנות את לוח הזמנים.'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-3 pt-4">
        <Button onClick={addTimeBlock} variant="outline" className="gap-2">
          <Plus className="w-4 h-4" />
          {lang === 'en' ? 'Add Time Block' : 'הוסף בלוק זמן'}
        </Button>
        
        {timeBlocks.length > 0 && (
          <Button 
            onClick={saveSchedule} 
            disabled={saving}
            className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {lang === 'en' ? 'Saving...' : 'שומר...'}
              </>
            ) : (
              lang === 'en' ? 'Save Schedule' : 'שמור לוח זמנים'
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
