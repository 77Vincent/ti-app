import { Card, CardBody, CardHeader } from "@heroui/react"
import { User } from "lucide-react"

type testTaker = {
    name: string,
    questionSubmitted: number,
    questionCorrect: number
}

export default function BestTestTakers() {
    const USERS: testTaker[] = [{
        name: "foo",
        questionSubmitted: 123,
        questionCorrect: 12,
    }]

    return (
        <div>
            {
                USERS.map(({name, questionSubmitted, questionCorrect}) => {
                    return (
                        <Card shadow="sm" key={`${name}-${questionCorrect}-${questionSubmitted}`}>
                            <CardHeader className="font-light text-default-800 gap-2">
                                <User size={18}/>
                                {name}
                            </CardHeader>
                            <CardBody>
                                <p className="text-4xl font-bold text-right">
                                    {questionCorrect} / {questionSubmitted}
                                </p>
                            </CardBody>
                        </Card>
                    )
                })
            }
        </div>
    )
}