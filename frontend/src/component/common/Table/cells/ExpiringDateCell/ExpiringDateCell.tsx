import { VFC } from 'react';
import { useLocationSettings } from 'hooks/useLocationSettings';
import { formatDateYMD } from 'utils/formatDate';
import { parseISO } from 'date-fns';
import { TextCell } from 'component/common/Table/cells/TextCell/TextCell';

interface IExpiringDateCellProps {
    value?: Date | string | null;
}

export const ExpiringDateCell: VFC<IExpiringDateCellProps> = ({ value }) => {
    const { locationSettings } = useLocationSettings();

    const date = value 
        ? value instanceof Date
            ? formatDateYMD(value, locationSettings.locale)
            : formatDateYMD(parseISO(value as string), locationSettings.locale)
        : undefined;

    const currentDate = new Date();
    const expirationDate = typeof value === 'string' ? new Date(value) : value;
    const isExpired = expirationDate ? expirationDate < currentDate : false;

    return (
        <TextCell lineClamp={1} style={{ color: isExpired ? 'red' : undefined }}>
            {date}
        </TextCell>
    );
};

