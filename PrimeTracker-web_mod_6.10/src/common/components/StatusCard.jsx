import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Rnd } from 'react-rnd';
import { makeStyles } from 'tss-react/mui';

import {
  Card,
  CardContent,
  Typography,
  CardActions,
  IconButton,
  Button,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Menu,
  MenuItem,
  CardMedia,
  TableFooter,
  Link,
  Tooltip,
} from '@mui/material';

import ArrowCircleUpIcon from '@mui/icons-material/ArrowCircleUp';
import CloseIcon from '@mui/icons-material/Close';
import RouteIcon from '@mui/icons-material/Route';
import DescriptionIcon from '@mui/icons-material/Description';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PendingIcon from '@mui/icons-material/Pending';
import AnchorIcon from '@mui/icons-material/Anchor';
import ShareLocationIcon from '@mui/icons-material/ShareLocation';
import AppleIcon from '@mui/icons-material/Apple';
import MapIcon from '@mui/icons-material/Map';
import NearMeIcon from '@mui/icons-material/NearMe';
import StreetviewIcon from '@mui/icons-material/Streetview';

import { useDeviceReadonly } from '../util/permissions';
import { useTranslation } from './LocalizationProvider';
import { devicesActions } from '../../store';
import { geofencesActions } from '../../store';
import { useCatch, useCatchCallback } from '../../reactHelper';
import { useAttributePreference } from '../util/preferences';
import { useRestriction } from '../util/permissions';
import RemoveDialog from './RemoveDialog';
import fetchOrThrow from '../util/fetchOrThrow';
import useSnackbar from './useSnackbar';
import PositionValue from './PositionValue';
import usePositionAttributes from '../attributes/usePositionAttributes';


const useStyles = makeStyles()((theme, { desktopPadding }) => ({
  card: {
    pointerEvents: 'auto',
    width: theme.dimensions.popupMaxWidth,
  },
  media: {
    height: theme.dimensions.popupImageHeight,
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
  },
  mediaButton: {
    color: theme.palette.primary.contrastText,
    mixBlendMode: 'difference',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing(1, 1, 0, 2),
  },
  content: {
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    maxHeight: theme.dimensions.cardContentMaxHeight,
    overflow: 'auto',
  },
  icon: {
    width: '25px',
    height: '25px',
    filter: 'brightness(0) invert(1)',
  },
  table: {
    '& .MuiTableCell-sizeSmall': {
      paddingLeft: 0,
      paddingRight: 0,
    },
    '& .MuiTableCell-sizeSmall:first-of-type': {
      paddingRight: theme.spacing(1),
    },
  },
  cell: {
    borderBottom: 'none',
  },
  actions: {
    justifyContent: 'space-between',
  },
  root: {
    pointerEvents: 'none',
    position: 'fixed',
    zIndex: 5,
    left: '50%',
    [theme.breakpoints.up('md')]: {
      left: `calc(50% + ${desktopPadding} / 2)`,
      bottom: theme.spacing(3),
    },
    [theme.breakpoints.down('md')]: {
      left: '50%',
      bottom: `calc(${theme.spacing(3)} + ${theme.dimensions.bottomBarHeight}px)`,
    },
    transform: 'translateX(-50%)',
  },
}));

const StatusRow = ({ name, content }) => {
  const { classes } = useStyles({ desktopPadding: 0 });

  return (
    <TableRow>
      <TableCell className={classes.cell}>
        <Typography variant="body2">{name}</Typography>
      </TableCell>
      <TableCell className={classes.cell}>
        <Typography variant="body2" color="textSecondary">{content}</Typography>
      </TableCell>
    </TableRow>
  );
};

const StatusCard = ({ deviceId, position, onClose, disableActions, desktopPadding = 0 }) => {
  const { classes } = useStyles({ desktopPadding });
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const t = useTranslation();
  const deviceReadonly = useDeviceReadonly();
  const device = useSelector((state) => state.devices.items[deviceId]);
  const deviceImage = device?.attributes?.deviceImage;
  const disableReports = useRestriction('disableReports');
  const positionAttributes = usePositionAttributes(t);
  const positionItems = useAttributePreference('positionItems', 'fixTime,address,speed,totalDistance');
  const navigationAppLink = useAttributePreference('navigationAppLink');
  const navigationAppTitle = useAttributePreference('navigationAppTitle');
  const [anchorEl, setAnchorEl] = useState(null);
  const [removing, setRemoving] = useState(false);
  const [AnchorGeofenceId, setAnchorGeofenceId] = useState(null);
  const { showSnackbar, SnackbarComponent } = useSnackbar();


  /** Inicio do bloco de funçoes da Âncora*/
  // Carrega o ID da geofence ativa, caso exista
  //Carrega o estado da âncora ao montar o componente

  useEffect(() => {
    if (!device?.name) return; // Garante que o nome do dispositivo esteja definido

    const controller = new AbortController();
    const { signal } = controller;

    fetchOrThrow(`/api/geofences`, { signal })
      .then((response) => {
        if (!response.ok) throw new Error(`Erro ${response.status}`);
        return response.json();
      })
      .then((geofences) => {
        const anchorId = geofences.find((g) => g.name === `${device.name} - Âncora`)?.id || null;
        setAnchorGeofenceId((prevId) => (prevId !== anchorId ? anchorId : prevId)); // Evita atualização desnecessária
      })
      .catch((error) => {
        if (!signal.aborted) {
          console.error("Erro ao buscar âncora:", error);
          showSnackbar('Erro', `Erro ao carregar o estado da âncora: ${error.message}`, 'error');
          setAnchorGeofenceId(null);
        }
      });

    return () => controller.abort(); // Cancela a requisição se o componente desmontar
  }, [device?.name]); // Dependência correta para evitar chamadas desnecessárias


  const handleActivateAnchor = (async () => {  // Função para Ativar a âncora (adiciona a geofence)
    try {
      const newGeofence = {
        name: `${device.name} - Âncora`,
        area: `CIRCLE (${position.latitude} ${position.longitude}, 50)`, // Círculo de 50 metros de raio
        attributes: { "color": "red" },
      };
      const response = await fetchOrThrow('/api/geofences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newGeofence),

      });

      if (response.ok) {
        const geofence = await response.json();
        const permissionResponse = await fetchOrThrow('/api/permissions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ deviceId: device.id, geofenceId: geofence.id }),
        });

        if (permissionResponse.ok) {
          setAnchorGeofenceId(geofence.id); // Armazena o ID da geofence de âncora
          refreshGeofences();
          showSnackbar('Âncora Ativada', 'Comando enviado com sucesso!', 'error');
        }
      }
    } catch (error) {
      handleErrorAnchor();
      showSnackbar('Aviso', 'Comando não enviado!', 'warning');
    }
  });

  const handleDeactivateAnchor = (async () => { // Função para desativar a âncora (remover a geofence)

    if (!AnchorGeofenceId) return; // Certifica-se de que existe uma âncora para remover

    try {
      const response = await fetchOrThrow(`/api/geofences/${AnchorGeofenceId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setAnchorGeofenceId(null); // Remove o ID da geofence de âncora
        handleAnchorSendResume('engineResume');
        refreshGeofences();
        showSnackbar('Âncora Desativada', 'Comando enviado com sucesso!', 'info');

      }
    } catch (error) {
      handleErrorAnchor();
      showSnackbar('Aviso', 'Comando não enviado!', 'warning');
    }
  });

  const handleErrorAnchor = (async () => { // Função para desativar a âncora em caso de erro de comando nao enviado (remover a geofence)

    if (!AnchorGeofenceId) return; // Certifica-se de que existe uma âncora para remover

    try {
      const response = await fetchOrThrow(`/api/geofences/${AnchorGeofenceId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setAnchorGeofenceId(null); // Remove o ID da geofence de âncora
        refreshGeofences();
      }
    } catch (error) {
      setAnchorGeofenceId(null); // Remove o ID da geofence de âncora 
      refreshGeofences();
    }
  });


  const refreshGeofences = useCatchCallback(async () => {
    const response = await fetchOrThrow('/api/geofences');
    if (response.ok) {

      dispatch(geofencesActions.refresh(await response.json()));

    } else {
      throw Error();
    }

  }, [dispatch]);

  /** Final do bloco de funçoes da Âncora*/


  /** Inicio bloco de comandos de envio engineStop engineResume*/


  const handleSendStop = async (command) => {
    try {
      const response = await fetchOrThrow(`/api/commands/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          deviceId,
          type: command,
        }),
      });
      if (!response.ok) {
        throw new Error('Falha ao enviar Comando');
      }
      showSnackbar('Bloqueio', 'Comando enviado com sucesso!', 'error');
    } catch (error) {
      showSnackbar('Aviso', 'Comando não enviado!', 'warning');
    }
  };

  const handleSendResume = async (command) => {
    try {
      const response = await fetchOrThrow(`/api/commands/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          deviceId,
          type: command,
        }),
      });
      if (!response.ok) {
        throw new Error('Falha ao enviar Comando');
      }
      showSnackbar('Desbloqueio', 'Comando enviado com sucesso!', 'success');
    } catch (error) {
      showSnackbar('Aviso', 'Comando não enviado!', 'warning');
    }
  };

  const handleAnchorSendResume = async (command) => {
    try {
      const response = await fetchOrThrow(`/api/commands/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          deviceId,
          type: command,
        }),
      });
      if (!response.ok) {
        throw new Error('Falha ao enviar Comando');
      }
    } catch (error) {
      showSnackbar('Aviso', 'Comando não enviado!', 'warning');
    }
  };

  /** Final bloco de comandos de envio engineStop, engineResume*/


  const handleGeofence = useCatchCallback(async () => {
    const newItem = {
      name: t('sharedGeofence'),
      area: `CIRCLE (${position.latitude} ${position.longitude}, 50)`,
      attributes: { "color": "orange" },
    };
    const response = await fetchOrThrow('/api/geofences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newItem),
    });
    if (response.ok) {
      const item = await response.json();
      const permissionResponse = await fetchOrThrow('/api/permissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId: position.deviceId, geofenceId: item.id }),
      });
      if (!permissionResponse.ok) {
        throw Error(await permissionResponse.text());
      }
      navigate(`/settings/geofence/${item.id}`);
    } else {
      throw Error(await response.text());
    }
  }, [navigate, position]);


  const handleRemove = useCatch(async (removed) => {
    if (removed) {
      const response = await fetchOrThrow('/api/devices');
      dispatch(devicesActions.refresh(await response.json()));
    }
    setRemoving(false);
  });


  return (
    <>
      <div className={classes.root}>
        {device && (
          <Rnd
            default={{ x: 0, y: 0, width: 'auto', height: 'auto' }}
            enableResizing={false}
            dragHandleClassName="draggable-header"
            style={{ position: 'relative' }}
          >
            <Card elevation={3} className={classes.card}>
              {deviceImage ? (
                <CardMedia
                  className={`${classes.media} draggable-header`}
                  image={`/api/media/${device.uniqueId}/${deviceImage}`}
                >
                  <IconButton
                    size="small"
                    onClick={onClose}
                    onTouchStart={onClose}
                  >
                    <CloseIcon fontSize="small" className={classes.mediaButton} />
                  </IconButton>
                </CardMedia>
              ) : (
                <div className={`${classes.header} draggable-header`}>
                  <Typography variant="body2" color="textSecondary">
                    {device.name}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={onClose}
                    onTouchStart={onClose}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </div>
              )}


              {/** Adicionando os botões de bloqueio e desbloqueio */}
              <div
                className={classes.buttonGroup}
                style={{
                  display: 'flex',
                  justifyContent: 'center', // centraliza horizontalmente
                  alignItems: 'center',     // alinha verticalmente
                  gap: '5px',              // espaço entre os botões
                  marginTop: '16px',        // margem superior opcional
                }}
              >

                <Tooltip title={t('Stop')}>
                  <Button
                    variant="contained"
                    color="error"
                    size="medium"
                    sx={{
                      minWidth: 130,
                      fontSize: 14,
                      fontWeight: 'bold',
                      paddingY: 1,
                      paddingX: 2,
                    }}
                    onClick={() => handleSendStop('engineStop')}
                  >
                    {t('Stop')}
                  </Button>
                </Tooltip>

                <Tooltip title={t('Resume')}>
                  <Button
                    variant="contained"
                    color="secondary"
                    size="medium"
                    sx={{
                      minWidth: 130,
                      fontSize: 14,
                      fontWeight: 'bold',
                      paddingY: 1,
                      paddingX: 2,
                    }}
                    onClick={() => handleSendResume('engineResume')}
                  >
                    {t('Resume')}
                  </Button>
                </Tooltip>

              </div>


              {position && (
                <CardContent className={classes.content}>
                  <Table size="small" classes={{ root: classes.table }}>
                    <TableBody>
                      {positionItems.split(',').filter((key) => position.hasOwnProperty(key) || position.attributes.hasOwnProperty(key)).map((key) => (
                        <StatusRow
                          key={key}
                          name={positionAttributes[key]?.name || key}
                          content={(
                            <PositionValue
                              position={position}
                              property={position.hasOwnProperty(key) ? key : null}
                              attribute={position.hasOwnProperty(key) ? null : key}
                            />
                          )}
                        />
                      ))}

                    </TableBody>
                    <TableFooter>
                      <TableRow>
                        <TableCell colSpan={2} className={classes.cell}>
                          <Typography variant="body2">
                            <Link component={RouterLink} to={`/position/${position.id}`}>{t('sharedShowDetails')}</Link>
                          </Typography>
                        </TableCell>
                      </TableRow>
                    </TableFooter>
                  </Table>
                </CardContent>
              )}


              <CardActions classes={{ root: classes.actions }} disableSpacing>
                <Tooltip title={t('sharedExtra')}>
                  <IconButton
                    color="secondary"
                    onClick={(e) => setAnchorEl(e.currentTarget)} disabled={!position}>
                    <PendingIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title={t('reportReplay')}>
                  <IconButton
                    color="primary"
                    onClick={() => navigate(`/replay?deviceId=${deviceId}`)}
                    disabled={disableActions || !position}>
                    <RouteIcon />
                  </IconButton>
                </Tooltip>

                <Tooltip title={t("reportTitle")}>
                  <IconButton
                    color="warning"
                    onClick={() => navigate(`/reports/events?eventType=allEvents/&deviceId=${deviceId}`)}
                    disabled={disableActions || !position || disableReports || deviceReadonly}>
                    <DescriptionIcon />
                  </IconButton>
                </Tooltip>

                <Tooltip title={t('sharedEdit')}>
                  <IconButton
                    color=""
                    onClick={() => navigate(`/settings/device/${deviceId}`)}
                    disabled={disableActions || deviceReadonly}
                  >
                    <EditIcon />
                  </IconButton>
                </Tooltip>

                <Tooltip title={t('sharedAnchorGeofence')}>
                  <IconButton
                    onClick={AnchorGeofenceId ? handleDeactivateAnchor : handleActivateAnchor}
                    color={AnchorGeofenceId ? "error" : "primary"} disabled={disableActions || !position || deviceReadonly}>
                    <AnchorIcon />
                  </IconButton>
                </Tooltip>

                <Tooltip title={t('sharedRemove')}>
                  <IconButton
                    color="error"
                    onClick={() => setRemoving(true)}
                    disabled={disableActions || deviceReadonly}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </CardActions>
            </Card>
          </Rnd>
        )}
      </div>

      {position && (
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>

          <MenuItem
            style={{ display: 'flex', alignItems: 'center' }}
            onClick={() => navigate(`/settings/device/${deviceId}/command`)}
            disabled={disableActions || !position || deviceReadonly}

          >
            <ArrowCircleUpIcon style={{ width: 20, height: 20, marginRight: 8 }} />
            {t('comandTitleSend')}

          </MenuItem>

          <MenuItem
            style={{ display: 'flex', alignItems: 'center' }}
            onClick={handleGeofence}
          >
            <ShareLocationIcon style={{ width: 20, height: 20, marginRight: 8 }} />
            {t('sharedCreateGeofence')}
          </MenuItem>

          <MenuItem
            component="a"
            target="_blank"
            href={`https://www.google.com/maps/place/${position.latitude}%2C${position.longitude}`}
            style={{ display: 'flex', alignItems: 'center' }}
          >
            <MapIcon style={{ width: 20, height: 20, marginRight: 8 }} />
            {t('linkGoogleMaps')}
          </MenuItem>

          <MenuItem
            component="a"
            target="_blank"
            href={`http://maps.apple.com/?ll=${position.latitude},${position.longitude}`}
            style={{ display: 'flex', alignItems: 'center' }}
          >
            <AppleIcon style={{ width: 20, height: 20, marginRight: 8 }} />
            {t('linkAppleMaps')}
          </MenuItem>

          <MenuItem
            component="a"
            target="_blank"
            href={`https://waze.com/ul?ll=${position?.latitude},${position?.longitude}&navigate=yes`}
            style={{ display: 'flex', alignItems: 'center' }}
          >
            <NearMeIcon style={{ width: 20, height: 20, marginRight: 8 }} />
            {t('linkWazeMaps')}
          </MenuItem>

          <MenuItem
            component="a"
            target="_blank"
            href={`https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${position.latitude}%2C${position.longitude}&heading=${position.course}`}
          >
            <StreetviewIcon style={{ width: 20, height: 20, marginRight: 8 }} />
            {t('linkStreetView')}
          </MenuItem>

          {navigationAppTitle &&
            <MenuItem component="a"
              target="_blank"
              href={navigationAppLink.replace('{latitude}', position.latitude).replace('{longitude}', position.longitude)}
            >
              {navigationAppTitle}
            </MenuItem>}
        </Menu>
      )}
      <RemoveDialog
        open={removing}
        endpoint="devices"
        itemId={deviceId}
        onResult={(removed) => handleRemove(removed)}
      />
      <SnackbarComponent />
    </>
  );
};

export default StatusCard;
