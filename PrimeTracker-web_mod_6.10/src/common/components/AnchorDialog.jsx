import { useState } from 'react';
import { Rnd } from 'react-rnd';
import {
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Paper,
  Fade,
  ToggleButtonGroup,
  ToggleButton,
  Divider,
  IconButton,
} from '@mui/material';
import CircleIcon from '@mui/icons-material/Circle';
import CloseIcon from '@mui/icons-material/Close';

const AnchorDialog = ({ open, onClose, onConfirm }) => {
  const [selectedColor, setSelectedColor] = useState('red');
  const [selectedRadius, setSelectedRadius] = useState(50);

  if (!open) return null;

  return (
    <Rnd
      default={{
        x: window.innerWidth / 2 - 180,
        y: window.innerHeight / 2 - 160,
        width: 'auto',
        height: 'auto',
      }}
      enableResizing={false}
      bounds="window"
      dragHandleClassName="draggable-header"
      style={{ zIndex: 2000 }}
    >
      <Fade in={open} timeout={300}>
        <Paper
          elevation={6}
          sx={{
            borderRadius: 4,
            overflow: 'hidden',
            p: 1.5,
            width: 320
          }}
        >
          <DialogTitle
            className="draggable-header"
            sx={{
              fontSize: 20,
              pb: 1,
              textAlign: 'center',
              fontWeight: 500,
              cursor: 'move',
              position: 'relative',
            }}
          >
            Confirmar Ativação da Âncora

            <IconButton
              className="no-drag"
              onClick={onClose}
              onTouchEnd={(e) => {
                e.stopPropagation();
                onClose();
              }}
              size="small"
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
                color: 'grey.600',
                '&:hover': { color: 'grey.800' },
                zIndex: 10,
                pointerEvents: 'auto',         // 👈 garante clique em mobile
                touchAction: 'manipulation',   // 👈 melhora resposta no Android
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>

          </DialogTitle>

          <DialogContent sx={{ pt: 0, pb: 1 }}>
            <Typography variant="body2" sx={{ lineHeight: 1.3, justifyContent: 'center', mb: 1 }}>
              Antes de ativar a Âncora, verifique as seguintes condições:
            </Typography>

            <Typography variant="body2" sx={{ lineHeight: 1.3, justifyContent: 'center', mb: 1 }}>
              <strong>O veículo está com a ignição ligada?</strong>
            </Typography>

            <Typography variant="body2" sx={{ lineHeight: 1.3, justifyContent: 'center' }}>
              <strong>Ative a Âncora somente se a ignição estiver ligada!</strong>
            </Typography>

            <Typography variant="body2" sx={{ lineHeight: 1.3, justifyContent: 'center', mt: 1 }}>
              <strong>Desligue a ignição somente após ativar a Âncora!</strong>
            </Typography>

            <Divider sx={{ my: 2 }} />

            {/* Seleção de Cor */}
            <Typography variant="body2" sx={{ fontWeight: 500, mb: 1, ml: 1 }}>
              Cor da Âncora:
            </Typography>

            <ToggleButtonGroup
              value={selectedColor}
              exclusive
              onChange={(_, value) => value && setSelectedColor(value)}
              sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}
            >
              {[
                { color: 'red' },
                { color: 'orange' },
                { color: 'yellow' },
                { color: 'green' },
                { color: 'blue' },
                { color: 'indigo' },
                { color: 'purple' },
              ].map(({ color }) => (
                <ToggleButton
                  key={color}
                  value={color}
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%', // 🔹 Totalmente circular
                    borderWidth: 1,
                    borderColor: 'divider',
                    mx: 0.5,
                    '&.Mui-selected': {
                      borderColor: 'primary.main',
                      borderWidth: 2,
                    },
                  }}
                >
                  <CircleIcon sx={{ color }} />
                </ToggleButton>
              ))}
            </ToggleButtonGroup>

            {/* Seleção de Raio */}
            <Typography variant="body2" sx={{ fontWeight: 500, mb: 1, ml: 1 }}>
              Raio da Âncora:
            </Typography>

            <ToggleButtonGroup
              value={selectedRadius}
              exclusive
              onChange={(_, value) => value && setSelectedRadius(value)}
              sx={{
                display: 'flex',
                justifyContent: 'center',
                gap: 1,
              }}
            >
              {[50, 100, 150].map((radius) => (
                <ToggleButton
                  key={radius}
                  value={radius}
                  sx={{
                    px: 2,
                    py: 0.4,
                    minWidth: 70,
                    borderRadius: 50,
                    borderWidth: 1,
                    borderColor: 'divider',
                    fontSize: '0.85rem',
                    fontWeight: 500,
                    textTransform: 'none',
                    color: 'text.primary',
                    transition: 'all 0.2s ease',
                    '&.Mui-selected': {
                      backgroundColor: 'primary.main',
                      color: '#fff !important', // 🔹 força branco mesmo no Android
                      borderColor: 'primary.main',
                      '& .MuiTypography-root, & span, & p': {
                        color: '#fff !important',
                      },
                      '&:hover': {
                        backgroundColor: 'primary.dark',
                      },
                    },
                    '&:hover': {
                      borderColor: 'primary.main',
                      color: 'primary.main',
                    },
                  }}
                >
                  {radius} m
                </ToggleButton>
              ))}
            </ToggleButtonGroup>

          </DialogContent>

          <DialogActions sx={{ justifyContent: 'center', pt: 1 }}>
            <Button size="small" variant="outlined" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              size="small"
              variant="contained"
              color="primary"
              onClick={() =>
                onConfirm({ color: selectedColor, radius: selectedRadius })
              }
            >
              Confirmar
            </Button>
          </DialogActions>
        </Paper>
      </Fade>
    </Rnd>
  );
};

export default AnchorDialog;
