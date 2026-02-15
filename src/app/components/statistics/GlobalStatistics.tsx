import { Card, CardBody, CardHeader } from "@heroui/react";
import {
    Timer as TotalTestTimeIcon,
    Book as TotalTestAttemptsIcon,
    FileQuestion as QuestionSubmittedIcon,
    Target as AverageAccuracyIcon, type LucideIcon
} from "lucide-react";

type stats = {
    label: string
    data: string
    icon: LucideIcon
}

export default function GlobalStatistics() {
    const STATS: stats[] = [{
        label: "Total test time",
        icon: TotalTestTimeIcon,
        data: "123min"
    }, {
        label: "Total test attempts",
        icon: TotalTestAttemptsIcon,
        data: "456",
    }, {
        label: "Question submitted",
        icon: QuestionSubmittedIcon,
        data: "1,234",
    }, {
        label: "Average accuracy",
        icon: AverageAccuracyIcon,
        data: "46%"
    }]

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {
                STATS.map(({ label, data, icon }) => {
                    const Icon = icon
                    return (
                        <Card shadow="sm" key={label}>
                            <CardHeader className="uppercase font-light text-default-800 gap-2">
                                <Icon size={20} />
                                {label}
                            </CardHeader>
                            <CardBody>
                                <p className="text-4xl font-bold text-right">{data}</p>
                            </CardBody>
                        </Card>
                    )
                })
            }
        </div >
    )
}