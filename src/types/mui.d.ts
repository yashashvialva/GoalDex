import '@mui/material/Typography';

declare module '@mui/material/Typography' {
  interface TypographyOwnProps {
    fontWeight?: number | string;
  }
}
