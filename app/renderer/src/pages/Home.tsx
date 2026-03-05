import { Box, Button, Stack } from "@mui/material"
import { Header } from "../components/Header"
import { routes } from "../types/routes"
import WarehouseIcon from '@mui/icons-material/Warehouse';
import StorageIcon from '@mui/icons-material/Storage';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import ScienceIcon from '@mui/icons-material/Science';
import { useNavigate } from "react-router-dom";
import { HomepageCard } from "../components/HomepageCard";

export const Home = () => {

  const navigator = useNavigate()

  return(<>
    <Header routes={routes}/> 
    <Stack direction={'row'} style={{height: '90%', marginTop:'30px'}} alignItems={'center'}>
      <Stack direction={'column'} flex={1}>

        <Stack direction={'row'} alignItems={'center'} justifyContent={'center'} sx={{marginBottom: '50px'}}>
          <Stack direction={'column'} alignItems={'center'} justifyContent={'center'}>
            <h1 style={{textAlign: 'center'}}>Система контроля и аналитики товарооборота (Система "СКАТ")</h1>
            <p>Система, которая возьмет на себя учет продаж Вашего магазина</p>
          </Stack>
        </Stack>

        <Stack direction={'row'}>
          <HomepageCard 
            Icon={<WarehouseIcon sx={{fontSize: '70px'}}/>}
            title="Учет закупок"
            description="Ни один купленный товар не пропадет!"
            buttonCLicked={() => navigator('/products')}
          />
          <HomepageCard 
            Icon={<StorageIcon sx={{fontSize: '70px'}}/>}
            title="Учет продаж"
            description="Все ваши продажи, как на ладони!"
            buttonCLicked={() => navigator('/sells')}
          />
          <HomepageCard 
            Icon={<LeaderboardIcon sx={{fontSize: '70px'}}/>}
            title="Аналитика"
            description="Будьте в тренде!"
            buttonCLicked={() => navigator('/analytics')}
          />
          <HomepageCard 
            Icon={<ScienceIcon sx={{fontSize: '70px'}}/>}
            title="Генератор тестовых данных"
            description="Проверьте систему на тестовых данных!"
            buttonCLicked={() => navigator('/testdata')}
          />
        </Stack>
      </Stack>
    </Stack>
  </>
  )
}//<Icon sx={{fontSize: '70px', marginBottom: '10px'}}></Icon>