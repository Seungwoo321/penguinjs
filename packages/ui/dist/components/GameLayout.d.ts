import * as React from "react";
interface GameLayoutProps {
    children: React.ReactNode;
    title: string;
    currentStage: number;
    totalStages: number;
    onHome?: () => void;
    onPrevious?: () => void;
    onHelp?: () => void;
    className?: string;
}
export declare const GameLayout: React.ForwardRefExoticComponent<GameLayoutProps & React.RefAttributes<HTMLDivElement>>;
interface GamePanelProps {
    children: React.ReactNode;
    title?: string;
    className?: string;
}
export declare const GamePanel: React.ForwardRefExoticComponent<GamePanelProps & React.RefAttributes<HTMLDivElement>>;
export {};
//# sourceMappingURL=GameLayout.d.ts.map