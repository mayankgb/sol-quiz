import { Header } from "./header";
import { Preview } from "./preview";
import { QuestionCreationPannel } from "./questionCreationPanel";
import { SidePannel } from "./sidePannel";

export function EditPageComponent() {
    return (
        <div>
            <Header />
            <div className="flex h-screen  pt-7 justify-between px-10">
                <SidePannel />
                <Preview />
                <QuestionCreationPannel />
            </div>
        </div>

    )
}