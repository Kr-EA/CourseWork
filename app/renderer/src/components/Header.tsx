import { Button } from "@mui/material"
import { useLocation, useNavigate, useSearchParams } from "react-router-dom"
import { HeaderProps } from "../types/types"

export const Header = ({routes} : HeaderProps) => {

    const navigator = useNavigate()
    const location = useLocation()

    return (<>
        {routes.map((el) => (
            <Button key={el.title} variant={location.pathname == el.path ? "contained" : "text"} onClick={() => (navigator(el.path))}>{el.title}</Button>
        ))}
    </>)
}