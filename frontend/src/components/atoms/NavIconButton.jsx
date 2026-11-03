import { Badge, IconButton, Tooltip } from '@mui/material'

export const FOCO_VISIBLE = {
  '&.Mui-focusVisible': { outline: '2px solid', outlineColor: 'primary.main', outlineOffset: 2 },
}


export default function NavIconButton({ label, badge = 0, punto = false, children, sx, ...resto }) {
  return (
    <Tooltip title={label}>
      <IconButton aria-label={label} color="inherit" sx={{ ...FOCO_VISIBLE, ...sx }} {...resto}>
        <Badge
          color="error"
          badgeContent={punto ? undefined : badge}
          max={9}
          variant={punto ? 'dot' : 'standard'}
          invisible={punto ? false : !badge}
        >
          {children}
        </Badge>
      </IconButton>
    </Tooltip>
  )
}
