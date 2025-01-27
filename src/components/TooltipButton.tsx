import PerplexityIcon from './icons/PerplexityIcon';

interface TooltipButtonProps {
    tooltipText: string;
    link: string;
}

export default function TooltipButton({ tooltipText, link }: TooltipButtonProps) {
    return (
        <div
            className="tooltip tooltip-right before:z-50"
            data-tip={tooltipText}
            onClick={() => window.open(link, '_blank')}
            role="button"
            style={{ cursor: 'pointer' }}
        >
            <PerplexityIcon />
        </div>
    );
}
