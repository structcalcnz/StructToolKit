import React, {useEffect} from 'react';
import { NavLink } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

import helpHtml from "@/docs/help.html?raw";

import { FilePen, Box, House, BarChart3, Wind, Info, HelpCircle,
     Settings, PanelLeftClose, PanelLeftOpen } from 'lucide-react';

const helpHtmlFixed = helpHtml.replace(
  /src="\/Dims_figure.svg"/g,
  `src="${import.meta.env.BASE_URL}Dims_figure.svg"`
);

const navItems = [
{ path: '/setup', label: 'Setup', icon: FilePen },
{ path: '/parts', label: 'Parts', icon: Box },
{ path: '/levels', label: 'Levels', icon: House },
{ path: '/analysis', label: 'Analysis', icon: BarChart3 },
{ path: '/bracing', label: 'Bracing', icon: Wind },
];

export function Sidebar() {
    const [collapsed, setCollapsed] = React.useState(true);

    const setTheme = (theme: 'light' | 'dark') => {
        const html = document.documentElement;
        if (theme === 'dark') {
            html.classList.add('dark');
        } else {
            html.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    };

    // Apply saved theme on mount
    useEffect(() => {
        const saved = localStorage.getItem('theme') as 'light' | 'dark' | null;
        if (saved) setTheme(saved);
    }, []);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 640) {
            setCollapsed(true);
            }
        };
        // Run once on mount to set the correct state
        //handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [collapsed]);

return (
    <TooltipProvider delayDuration={100}>
    <div  className={cn(
          "flex flex-col h-full border-r bg-muted/40 transition-all duration-300",
          collapsed ? "w-16" : "w-48"
        )}>
        {/* Header */}
        <div className="p-4 flex items-center">
            {!collapsed && <h2 className="text-lg font-bold">StructToolKit</h2>}
            <Button
                variant="ghost"
                size="icon"
                onClick={() => setCollapsed(!collapsed)}
                className="ml-auto"
            >
                {collapsed ? (
                <PanelLeftOpen className="w-5 h-5" />
                ) : (
                <PanelLeftClose className="w-5 h-5" />
                )}
            </Button>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-2 mb-2 p-2">
            {navItems.map((item) => (
                <NavLink to={item.path} key={item.path}>
                    {({ isActive }) => (
                        <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant={isActive ? 'default' : 'ghost'}
                                className={cn("w-full justify-start transition-all",
                                                collapsed && "justify-center"
                                            )}
                            >
                                <item.icon className={cn("w-5 h-5", collapsed && "w-6 h-6")} />
                                {!collapsed && <span className="ml-2">{item.label}</span>}
                            </Button>
                        </TooltipTrigger>
                        {collapsed && <TooltipContent side="right">{item.label}</TooltipContent>}
                        </Tooltip>
                    )}
                </NavLink>
            ))}
        </nav>

        {/* Footer */}
        <div className="mt-auto p-2">
            <Separator className="my-4" />

            <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className={cn("w-full justify-start", collapsed && "justify-center")}>
                <Settings className={cn("h-4 w-4", collapsed && "w-6 h-6")} />
                {!collapsed && "Settings"}
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                align="start"
                className="w-48"
                side={collapsed ? "right" : "top"}
            >
                <DropdownMenuItem onClick={() => setTheme('light')}>
                Light Theme
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('dark')}>
                Dark Theme
                </DropdownMenuItem>
                {/* You can add more settings options here later */}
            </DropdownMenuContent>                
            </DropdownMenu>

            {/* Help */}
            <Dialog>
                <Tooltip>
                <TooltipTrigger asChild>
                <DialogTrigger asChild>
                    <Button variant="ghost" className={cn("w-full justify-start", collapsed && "justify-center")}>
                        <HelpCircle className={cn("h-4 w-4", collapsed && "w-6 h-6")} />
                        {!collapsed && "Help"}
                    </Button>
                </DialogTrigger>
                 </TooltipTrigger>
                    {collapsed && <TooltipContent side="right">Help</TooltipContent>}
                </Tooltip>           
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Structural Design Tool Kits</DialogTitle>
                        <DialogDescription className="max-h-[60vh] overflow-y-auto p-3">
                            <div
                                className="prose dark:prose-invert max-w-none text-sm"
                                dangerouslySetInnerHTML={{ __html: helpHtmlFixed }}
                            />
                        </DialogDescription>
                    </DialogHeader>
                </DialogContent>
            </Dialog>

            {/* About */}
            <Dialog>
                <Tooltip>
                <TooltipTrigger asChild>
                <DialogTrigger asChild>
                    <Button variant="ghost" className={cn("w-full justify-start", collapsed && "justify-center")}>
                        <Info className={cn("h-4 w-4", collapsed && "w-6 h-6")} />
                        {!collapsed && "About"}
                    </Button>
                </DialogTrigger>
                </TooltipTrigger>
                    {collapsed && <TooltipContent side="right">About</TooltipContent>}
                </Tooltip>
                <DialogContent>
                    <DialogHeader>
                    <DialogTitle>About This Application</DialogTitle>
                    <DialogDescription className='p-3'>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            This <strong>Structural Design Tool Kits</strong> is developed for educational and conceptual design purposes. 
                            It is built using React, Vite, TypeScript, Tailwind CSS, and Shadcn UI. 
                            You can use it to explore vertical and lateral actions design preliminarily in accordance with NZS 3604 and NZS 1170 provisions.
                        </p>

                        <h4 className="font-semibold mt-4 mb-2">Disclaimer:</h4>
                        <p className="text-sm text-amber-700 dark:text-amber-200">
                            <strong>This application is not intended for professional engineering design work.</strong> <br />
                            All calculations and results must be verified by a qualified structural engineer before used. 
                            The developers are not responsible for any design errors, misinterpretations, or construction issues. 
                            Use at your own risk. All designs must comply with relevant local building codes and standards.
                        </p>

                        <h4 className="font-semibold mt-4 mb-2">Reporting Bugs:</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            To report a bug, please email a detailed description of the issue, including any error messages, steps to reproduce, and your environment or browser version. 
                            Contact Email: <a href="mailto:structcalcnz@gmail.com" className="underline">structcalcnz@gmail.com</a>
                        </p>

                        <h4 className="font-semibold mt-4 mb-2">Copyright and License:</h4>
                        <div className="text-smtext-gray-500 dark:text-gray-600 mt-1">
                        <p>
                            &copy; {new Date().getFullYear()} StructCalcNZ. All rights reserved. <br />
                            This web application is provided as a design aid and may be freely used for non-commercial and commercial projects.</p>
                            <p><strong>Restrictions:</strong></p>
                            <ul>
                            <li>Modification, copying or reuse of the underlying code, scripts, or internal functionality without permission is prohibited.</li>
                            <li>This tool is not a substitute for professional engineering judgment. </li>
                            <li>Users assume full responsibility for the accuracy of inputs, calculations, and designs. 
                                All outputs must be reviewed and approved by a qualified structural engineer prior to construction.</li>
                            </ul>
                            <p>For full licensing details, limitations, and warranty disclaimers, refer to the LICENSE file in the repository.</p>   
                        </div>
                    </DialogDescription>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
            {!collapsed && (<p className="text-xs text-center text-muted-foreground m-2">© NZSC {new Date().getFullYear()}</p>)}
        </div>
    </div>
    </TooltipProvider>
    );
}