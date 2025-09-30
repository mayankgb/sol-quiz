import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { TabsContent } from "@/components/ui/tabs";
import { usePaidQuizStore } from "@/store/createQuiz";

export function PaidQuiz() {

    const {paidQuizTitle, prize, description, setPaidQuizField} = usePaidQuizStore()

    function handleInputChange(key: "paidQuizTitle" | "description"  | "prize", value: string) { 
   
            setPaidQuizField(key, value)
        
    }

    return (
        <TabsContent value="paid" className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="paidQuizTitle">Quiz Title</Label>
                <Input
                    id="paidQuizTitle"
                    placeholder="Enter prize quiz title"
                    value={paidQuizTitle}
                    onChange={(e) => handleInputChange( "paidQuizTitle", e.target.value)}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="prizeAmount">Prize Amount (in SOL)</Label>
                <Input
                    id="prizeAmount"
                    type="number"
                    min="0.1"
                    step="0.1"
                    placeholder="0.0"
                    value={prize}
                    onChange={(e) => handleInputChange( "prize", e.target.value)}
                />
                <p className="text-xs text-gray-500">Platform fee: 3% (SOL)</p>
            </div>

            <div className="space-y-2">
                <Label htmlFor="paidDescription">Description</Label>
                <Textarea
                    id="paidDescription"
                    placeholder="Describe your prize quiz"
                    value={description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                />
            </div>
        </TabsContent>
    )
}