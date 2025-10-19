import { useState } from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import { snackBarDurationShortMs } from '../util/duration';

const useSnackbar = () => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState('success');
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState(snackBarDurationShortMs);

  const showSnackbar = (
    title,
    msg,
    severity = 'success',
    durationMs = snackBarDurationShortMs
  ) => {
    setTitle(title);
    setMessage(msg);
    setSeverity(severity);
    setDuration(durationMs);
    setOpen(true);
  };

  // ✅ Corrigido — impede fechamento por clique fora
  const closeSnackbar = (_, reason) => {
    if (reason === 'clickaway') return;
    setOpen(false);
  };

  const SnackbarComponent = () => (
    <Snackbar
      key={message}
      open={open}
      autoHideDuration={duration}
      onClose={(event, reason) => closeSnackbar(event, reason)}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1000, // 🔝 garante que fique acima de tudo
        pointerEvents: 'auto',
      }}
    >
      <Alert
        variant="filled"
        elevation={6}
        onClose={() => closeSnackbar()}
        severity={severity}
        sx={{
          width: '100%',
          boxShadow: '0px 3px 10px rgba(0,0,0,0.3)',
        }}
      >
        {title && <AlertTitle>{title}</AlertTitle>}
        {message}
      </Alert>
    </Snackbar>
  );

  return { showSnackbar, SnackbarComponent, closeSnackbar };
};

export default useSnackbar;
