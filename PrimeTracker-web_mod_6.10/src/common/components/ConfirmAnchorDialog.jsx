import { Rnd } from 'react-rnd';
import {
    DialogTitle,
    DialogContent,
    DialogActions,
    Typography,
    Button,
    Paper,
    Fade,
} from '@mui/material';
import KeyIcon from '@mui/icons-material/VpnKey';

const ConfirmAnchorDialog = ({ open, onClose, onConfirm }) => {
    if (!open) return null; // evita render desnecessário

    return (
        <Rnd
            default={{
                x: window.innerWidth / 2 - 210,
                y: window.innerHeight / 2 - 120,
                width: 420,
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
                        p: 1,
                        width: 420,
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
                        }}
                    >
                        Confirmar Ativação da Âncora
                    </DialogTitle>

                    <DialogContent sx={{ pt: 0, pb: 1 }}>
                        <Typography
                            variant="body2"
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                lineHeight: 1.6,
                                mt: 1,
                                mb: 1,
                                ml: 3,
                            }}
                        >
                            <KeyIcon sx={{ color: '#fbc02d', fontSize: 20, ml: 2 }} />
                            O veículo está com a ignição ligada?
                        </Typography>

                        <Typography variant="body2" sx={{ lineHeight: 1.6, ml: 2 }}>
                            <strong>Somente desligue a ignição após ativar a Âncora.</strong>
                        </Typography>
                    </DialogContent>

                    <DialogActions sx={{ justifyContent: 'center', pt: 1 }}>
                        <Button size="small" variant="outlined" onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button size="small" variant="contained" color="primary" onClick={onConfirm}>
                            Confirmar
                        </Button>
                    </DialogActions>
                </Paper>
            </Fade>
        </Rnd>
    );
};

export default ConfirmAnchorDialog;
