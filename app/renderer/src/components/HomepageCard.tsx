import { Box, Button, Stack } from "@mui/material"
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { JSX } from "react"
import { defaultBgColor, iconsDefaultColor } from "../types/colors";

export const HomepageCard = (props: {Icon: JSX.Element, title: string, description: string, buttonCLicked: () => void}) => {
    return (<>
        <Box sx={{flex: 1, margin: '20px', maxHeight: '200px'}}>        
            <Stack direction={'column'} alignItems={'center'}>   
                {props.Icon}
                <h5>{props.title}</h5>
                <span style={{textAlign: 'center'}}>{props.description}</span>
                <Button onClick={props.buttonCLicked} sx={{marginTop: '10px', aspectRatio: '1/1', width:'50px', borderRadius: '100%', backgroundColor: iconsDefaultColor, color: defaultBgColor}}>
                    <ArrowForwardIcon/>
                </Button>
            </Stack> 
        </Box>
    </>)
}