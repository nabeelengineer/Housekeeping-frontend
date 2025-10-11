import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#636B2F',
      light: '#8a944e',
      dark: '#474e21',
      contrastText: '#ffffff',
    },
    secondary: { main: '#FF6584' },
    background: { default: '#F3F4F6', paper: '#FFFFFF' },
    text: { primary: '#111827', secondary: '#6B7280' },
  },
  shape: { borderRadius: 14 },
  typography: {
    fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        '*, *::before, *::after': {
          boxSizing: 'border-box',
        },
        'a, button, [role="button"], input, select, textarea': {
          outline: 'none !important',
        },
        'a': {
          textDecoration: 'none',
          color: 'inherit',
        },
        'a:hover': {
          color: 'inherit',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 10,
          fontWeight: 600,
          '&:hover': { backgroundColor: 'transparent', borderColor: 'inherit' },
          '&.Mui-focusVisible, &:focus': { outline: 'none', boxShadow: 'none' },
          '&:active': { boxShadow: 'none', outline: 'none' },
        },
      },
    },
    MuiButtonBase: {
      defaultProps: { disableRipple: true, disableTouchRipple: true },
      styleOverrides: {
        root: {
          '&:focus, &.Mui-focusVisible': { outline: 'none', boxShadow: 'none' },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          '&:hover': { backgroundColor: 'transparent' },
          '&:focus, &.Mui-focusVisible': { outline: 'none', boxShadow: 'none' },
          '&:active': { boxShadow: 'none', outline: 'none' },
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          '&:hover': { backgroundColor: 'transparent' },
          '&:focus, &.Mui-focusVisible': { outline: 'none' },
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          '&:hover': { backgroundColor: 'transparent' },
          '&:focus, &.Mui-focusVisible': { outline: 'none' },
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          '&:hover': { backgroundColor: 'transparent' },
          '&:focus, &.Mui-focusVisible': { outline: 'none' },
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          color: 'inherit',
          textDecoration: 'none',
          '&:hover': { color: 'inherit', textDecoration: 'none' },
          '&:focus, &.Mui-focusVisible': { outline: 'none' },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { borderRadius: 16 },
      },
    },
    MuiTextField: {
      defaultProps: { size: 'small' },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'inherit' },
          '& .MuiOutlinedInput-notchedOutline': { transition: 'border-color 0.2s ease' },
          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'inherit' },
          '&:focus, &.Mui-focusVisible': { outline: 'none' },
        },
      },
    },
  },
})

export default theme
