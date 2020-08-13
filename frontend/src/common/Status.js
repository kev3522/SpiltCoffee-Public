import React from 'react';
import {
    EuiHealth,
} from '@elastic/eui'

function Status(props) {

    let color = ""
    let label = ""
    switch (props.status) {
        case 0:
        color = "white"
        label = "New"
        break;
        case 1:
        color = "subdued"
        label = props.isMonitoring ? "Scheduled" : "Queued"
        break;
        case 2:
        color = "warning"
        label = props.isMonitoring ? "Monitoring" : "In Progress"
        break;
        case 3:
        color = "success"
        label = "Complete"
        break;
        case 4:
        color = "danger"
        label = "Not Found"
        break;
        default:
        color = "danger"
        label = "Failed"
    }

    return <EuiHealth color={color}>{label}</EuiHealth>;
}

export default Status;