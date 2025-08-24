import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  ChevronDown,
  User,
  Calendar,
  FileCheck,
  Wrench,
  Zap,
  Circle
} from "lucide-react";
import { useState } from "react";
import type { ListingData } from "@/lib/mockData";

interface InspectionReportProps {
  inspection: ListingData["inspection"];
}

const getStatusIcon = (status: "good" | "warning" | "critical") => {
  switch (status) {
    case "good":
      return <CheckCircle className="h-4 w-4 text-success" />;
    case "warning":
      return <AlertTriangle className="h-4 w-4 text-warning" />;
    case "critical":
      return <XCircle className="h-4 w-4 text-destructive" />;
  }
};

const getStatusBadge = (status: "good" | "warning" | "critical") => {
  switch (status) {
    case "good":
      return <Badge className="bg-success text-white">Хорошо</Badge>;
    case "warning":
      return <Badge className="bg-warning text-white">Внимание</Badge>;
    case "critical":
      return <Badge className="bg-destructive text-white">Критично</Badge>;
  }
};

export const InspectionReport = ({ inspection }: InspectionReportProps) => {
  const [openSections, setOpenSections] = useState<string[]>(["summary"]);

  const toggleSection = (section: string) => {
    setOpenSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const sections = [
    {
      id: "bodyPaint",
      title: "Кузов и ЛКП",
      icon: <Circle className="h-4 w-4" />,
      status: inspection.checklist.bodyPaint.status,
      content: (
        <div className="space-y-4">
          <div>
            <h5 className="font-medium mb-2">Толщина ЛКП по панелям</h5>
            <div className="grid grid-cols-2 gap-2">
              {inspection.checklist.bodyPaint.panels.map((panel) => (
                <div key={panel.name} className="flex items-center justify-between p-2 bg-muted rounded">
                  <span className="text-sm">{panel.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono">{panel.thickness}μm</span>
                    {getStatusIcon(panel.status)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      id: "powertrain",
      title: "Двигатель и трансмиссия",
      icon: <Wrench className="h-4 w-4" />,
      status: inspection.checklist.powertrain.status,
      content: (
        <div className="space-y-3">
          <div>
            <h5 className="font-medium mb-2">Диагностика OBD</h5>
            {inspection.checklist.powertrain.obdCodes.length > 0 ? (
              <div className="space-y-1">
                {inspection.checklist.powertrain.obdCodes.map((code) => (
                  <Badge key={code} variant="destructive">{code}</Badge>
                ))}
              </div>
            ) : (
              <Badge className="bg-success text-white">Ошибок не обнаружено</Badge>
            )}
          </div>
          <div>
            <h5 className="font-medium mb-1">Примечания</h5>
            <p className="text-sm text-muted-foreground">{inspection.checklist.powertrain.notes}</p>
          </div>
        </div>
      )
    },
    {
      id: "suspension",
      title: "Подвеска",
      icon: <Wrench className="h-4 w-4" />,
      status: inspection.checklist.suspension.status,
      content: (
        <p className="text-sm text-muted-foreground">{inspection.checklist.suspension.notes}</p>
      )
    },
    {
      id: "brakes",
      title: "Тормозная система",
      icon: <Circle className="h-4 w-4" />,
      status: inspection.checklist.brakes.status,
      content: (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-muted rounded">
              <div className="text-lg font-bold">{inspection.checklist.brakes.frontPads}%</div>
              <div className="text-sm text-muted-foreground">Передние колодки</div>
            </div>
            <div className="text-center p-3 bg-muted rounded">
              <div className="text-lg font-bold">{inspection.checklist.brakes.rearPads}%</div>
              <div className="text-sm text-muted-foreground">Задние колодки</div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">{inspection.checklist.brakes.notes}</p>
        </div>
      )
    },
    {
      id: "tires",
      title: "Шины и диски",
      icon: <Circle className="h-4 w-4" />,
      status: inspection.checklist.tires[0]?.status || "good",
      content: (
        <div className="grid grid-cols-2 gap-3">
          {inspection.checklist.tires.map((tire) => (
            <div key={tire.position} className="p-3 bg-muted rounded">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{tire.position}</span>
                {getStatusIcon(tire.status)}
              </div>
              <div className="text-xs text-muted-foreground space-y-1">
                <div>DOT: {tire.dot}</div>
                <div>Протектор: {tire.treadDepth}мм</div>
              </div>
            </div>
          ))}
        </div>
      )
    },
    {
      id: "interior",
      title: "Салон",
      icon: <User className="h-4 w-4" />,
      status: inspection.checklist.interior.status,
      content: (
        <p className="text-sm text-muted-foreground">{inspection.checklist.interior.notes}</p>
      )
    },
    {
      id: "electronics",
      title: "Электроника",
      icon: <Zap className="h-4 w-4" />,
      status: inspection.checklist.electronics.status,
      content: (
        <p className="text-sm text-muted-foreground">{inspection.checklist.electronics.notes}</p>
      )
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileCheck className="h-5 w-5" />
          Экспертная оценка
        </CardTitle>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <User className="h-4 w-4" />
            {inspection.expertName}
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {new Date(inspection.inspectedAt).toLocaleDateString('ru-RU')}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Expert Summary */}
        <Collapsible 
          open={openSections.includes("summary")} 
          onOpenChange={() => toggleSection("summary")}
        >
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-0 h-auto">
              <div className="flex items-center gap-2">
                <FileCheck className="h-4 w-4" />
                <span className="font-medium">Заключение эксперта</span>
              </div>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3">
            <div className="p-4 bg-info/10 border border-info/20 rounded-lg">
              <p className="text-sm leading-relaxed">{inspection.expertSummary}</p>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Inspection Sections */}
        <div className="space-y-2">
          {sections.map((section) => (
            <Collapsible 
              key={section.id}
              open={openSections.includes(section.id)}
              onOpenChange={() => toggleSection(section.id)}
            >
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between p-3 h-auto border">
                  <div className="flex items-center gap-3">
                    {section.icon}
                    <span className="font-medium">{section.title}</span>
                    {getStatusIcon(section.status)}
                  </div>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="px-3 pb-3">
                {section.content}
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>

        {/* Legal Status */}
        <div className="pt-4 border-t">
          <h4 className="font-semibold mb-3">Правовая проверка</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Статус ПТС</span>
              {getStatusBadge(inspection.legal.titleStatus === "clean" ? "good" : "critical")}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Обременения</span>
              {getStatusBadge(inspection.legal.encumbrances ? "critical" : "good")}
            </div>
            <p className="text-sm text-muted-foreground">{inspection.legal.notes}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};