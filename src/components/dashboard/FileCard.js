import React from 'react'

export default function FileCard(props) {
    return (
        <div>
            <p>{props.file.name + props.file.type}</p>
        </div>
    )
}
