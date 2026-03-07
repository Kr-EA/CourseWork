import { Box, Button, Stack } from "@mui/material"
import { useLocation, useNavigate } from "react-router-dom"
import { HeaderProps } from "../types/types"
import { accentColor, defaultBgColor } from "../types/colors"

export const Header = ({routes} : HeaderProps) => {

    const navigator = useNavigate()
    const location = useLocation()

    return (<>
        <Stack direction={'row'} style={{width: '100%', marginBottom: '10px'}} alignItems={'center'} justifyContent={'space-around'}>
            <Box sx = {{border: `1px solid ${accentColor}`, padding: '10px', borderRadius: '20px'}}>
                {routes.map((el) => (
                <Button sx={
                    {
                        marginRight: '5px', 
                        borderRadius: 0, 
                        borderBottom: ((location.pathname == el.path) ? `2px solid ${accentColor}` : '0px'),
                        '&:hover': {
                            backgroundColor: defaultBgColor,
                        },
                    }} 
                    key={el.title} 
                    variant={'text'} 
                    onClick={() => (navigator(el.path))}>{el.title}</Button>
            ))}
            </Box>
        </Stack>
    </>)
}