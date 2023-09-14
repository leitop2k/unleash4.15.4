import { FC } from 'react';
import { Box } from '@mui/material';
import { useStyles } from './TextCell.styles';

interface ITextCellProps {
    value?: string | null;
    lineClamp?: number;
    'data-testid'?: string;
    style?: React.CSSProperties;
}

export const TextCell: FC<ITextCellProps> = ({
    value,
    children,
    lineClamp,
    'data-testid': testid,
    style
}) => {
    const { classes } = useStyles({ lineClamp });

    return (
        <Box className={classes.wrapper} style={style}>
            <span data-loading="true" data-testid={testid}>
                {children ?? value}
            </span>
        </Box>
    );
};
