
import { createMuiTheme } from '@material-ui/core/styles';

const themes = createMuiTheme({
    palette: {
      primary: {
        main: '#7DABEA',
        light: '#A1C3F8',
        dark: '#446DB7',
        contrastText: '#FFFFFF'
      },
      secondary: {
        main: '#F584A9',
        contrastText: '#FFFFFF'
      },
    },
});

export default themes;