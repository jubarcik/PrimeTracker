import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton,
  Link
} from '@mui/material';

import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';

const ContactDialog = ({ open, onClose }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{
        paper: {
          sx: { borderRadius: 3, p: 1 }
        }
      }}
    >
      <DialogTitle
        sx={{
          fontSize: 22,
          textAlign: 'center',
          pb: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 1
        }}
      >
        <SupportAgentIcon fontSize="large" />
        Contato
      </DialogTitle>

      <DialogContent sx={{ textAlign: 'center' }}>
        <Typography variant="body2" sx={{ mb: 2 }}>
          Entre em contato pelo WhatsApp.
        </Typography>

        <Box sx={{ textAlign: 'left', mt: 1 }}>

          {/* ✅ WhatsApp */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              mt: 1
            }}
          >
            <Typography variant="body1">
              <b>(41) 99886-2427</b>
            </Typography>

            <IconButton
              sx={{
                backgroundColor: '#25D366',
                width: 30,
                height: 30,
                '&:hover': { backgroundColor: '#20bd5d' },
                ml: 1
              }}
            >
              <WhatsAppIcon sx={{ color: 'white', fontSize: 20 }} />
            </IconButton>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button
          fullWidth
          variant="contained"
          onClick={onClose}
          sx={{ borderRadius: 2 }}
        >
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ContactDialog;
