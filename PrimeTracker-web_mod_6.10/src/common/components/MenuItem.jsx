import { makeStyles } from 'tss-react/mui';
import { ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { Link } from 'react-router-dom';

const useStyles = makeStyles()(() => ({
  menuItemText: {
    whiteSpace: 'nowrap',
  },
}));

const MenuItem = ({ title, link, icon, selected, onClick }) => {
  const { classes } = useStyles();

  const buttonProps = link
    ? { component: Link, to: link }   // ✅ navega
    : { component: 'button', type: 'button' }; // ✅ executa onClick sem navegação

  return (
    <ListItemButton
      {...buttonProps}
      selected={selected}
      onClick={onClick}   // ✅ agora funciona sempre
    >
      <ListItemIcon>{icon}</ListItemIcon>
      <ListItemText primary={title} className={classes.menuItemText} />
    </ListItemButton>
  );
};

export default MenuItem;
