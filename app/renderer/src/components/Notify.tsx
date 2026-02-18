import { Button, Dialog } from "@mui/material"
import { useState } from "react"

export const Notify = (props: {active: boolean, message: string, submitListener: () => void}) => {

    return (
        <Dialog open={props.active}>
            <h1>{props.message}</h1>
            <Button onClick={props.submitListener}>Закрыть</Button>
        </Dialog>
    )
}