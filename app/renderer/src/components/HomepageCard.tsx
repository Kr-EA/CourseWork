import { Box, Button, Stack } from "@mui/material"
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { JSX } from "react"
import { defaultBgColor, iconsDefaultColor } from "../types/colors";

export const HomepageCard = (props: {id: string, Icon: JSX.Element, title: string, description: string, buttonCLicked: () => void}) => {
    return (<>
        <Box id={props.id} className='homepage-card' sx={{flex: 1, margin: '20px', maxHeight: '400px'}}>        
            <Stack direction={'column'} alignItems={'center'} justifyContent={'space-between'} sx={{height: '100%'}}>   
                {props.Icon}
                <h5 style={{fontSize: '16pt'}}>{props.title}</h5>
                <span style={{fontSize: '12pt', textAlign: 'center'}}>{props.description}</span>
                <Button className='go-button' onClick={props.buttonCLicked} sx={{marginTop: '10px', borderRadius: '100%', backgroundColor: iconsDefaultColor, color: defaultBgColor}}>
                    <ArrowForwardIcon/>
                </Button>
            </Stack> 
        </Box>
    </>)
}