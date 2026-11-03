import {
  Box,
  Button,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Popover,
  Typography,
} from '@mui/material'
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined'
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined'
import RequestQuoteOutlinedIcon from '@mui/icons-material/RequestQuoteOutlined'
import RequestPageOutlinedIcon from '@mui/icons-material/RequestPageOutlined'
import HelpOutlineIcon from '@mui/icons-material/HelpOutlineOutlined'
import QuestionAnswerOutlinedIcon from '@mui/icons-material/QuestionAnswerOutlined'
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutlineOutlined'
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined'
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined'
import StarBorderIcon from '@mui/icons-material/StarBorderOutlined'
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined'
import { tiempoRelativo } from '../../utils/fechas'

const ICONO_POR_TIPO = {
  pedido_estado: LocalShippingOutlinedIcon,
  cotizacion_respondida: RequestQuoteOutlinedIcon,
  pregunta_respondida: HelpOutlineIcon,
  mensaje_nuevo: ChatBubbleOutlineIcon,
  oferta_deseos: LocalOfferOutlinedIcon,
  pedido_nuevo: ShoppingBagOutlinedIcon,
  cotizacion_recibida: RequestPageOutlinedIcon,
  pregunta_nueva: QuestionAnswerOutlinedIcon,
  resena_nueva: StarBorderIcon,
  stock_bajo: Inventory2OutlinedIcon,
}

const SOLO_LECTORES = {
  position: 'absolute',
  width: 1,
  height: 1,
  overflow: 'hidden',
  clipPath: 'inset(50%)',
  whiteSpace: 'nowrap',
}

export default function PanelNotificaciones({
  anchorEl,
  onClose,
  notificaciones,
  noLeidas,
  onClickNotificacion,
  onMarcarTodas,
}) {
  return (
    <Popover
      id="panel-notificaciones"
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      slotProps={{
        paper: {
          role: 'dialog',
          'aria-label': 'Notificaciones',
          sx: { width: { xs: 'calc(100vw - 16px)', sm: 380 }, maxHeight: '70vh', display: 'flex', flexDirection: 'column' },
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1, borderBottom: 1, borderColor: 'divider' }}>
        <Typography component="h2" sx={{ fontWeight: 700, fontSize: 16 }}>
          Notificaciones
        </Typography>
        <Button size="small" onClick={onMarcarTodas} disabled={noLeidas === 0} sx={{ textTransform: 'none' }}>
          Marcar todas como leídas
        </Button>
      </Box>

      {notificaciones.length === 0 ? (
        <Typography sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
          No tienes notificaciones
        </Typography>
      ) : (
        <List disablePadding sx={{ overflowY: 'auto' }}>
          {notificaciones.map((n) => {
            const Icono = ICONO_POR_TIPO[n.tipo] ?? NotificationsNoneOutlinedIcon
            return (
              <ListItemButton
                key={n.id}
                onClick={() => onClickNotificacion(n)}
                sx={{ alignItems: 'flex-start', gap: 1, bgcolor: n.leida ? 'transparent' : 'action.hover' }}
              >
                <ListItemIcon sx={{ minWidth: 36, mt: 0.5 }}>
                  <Icono fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={n.titulo}
                  secondary={
                    <>
                      <Box component="span" sx={{ display: 'block' }}>{n.detalle}</Box>
                      <Box component="span" sx={{ display: 'block', mt: 0.25 }}>{tiempoRelativo(n.fecha)}</Box>
                    </>
                  }
                  slotProps={{ primary: { sx: { fontWeight: n.leida ? 400 : 700, fontSize: 14 } } }}
                />
                {!n.leida && (
                  <>
                    <Box aria-hidden="true" sx={{ width: 10, height: 10, mt: 1, borderRadius: '50%', bgcolor: 'primary.main', flexShrink: 0 }} />
                    <Box component="span" sx={SOLO_LECTORES}>No leída</Box>
                  </>
                )}
              </ListItemButton>
            )
          })}
        </List>
      )}
    </Popover>
  )
}
