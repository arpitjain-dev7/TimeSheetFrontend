import { Box, CircularProgress, Typography } from '@mui/material';

/**
 * Full-screen loading spinner shown while auth state is being restored.
 */
const Loader = ({ message = 'Loading...' }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a237e 0%, #0d47a1 50%, #01579b 100%)',
        gap: 2,
      }}
    >
      <CircularProgress size={56} thickness={4} sx={{ color: '#fff' }} />
      <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.85)', fontWeight: 400 }}>
        {message}
      </Typography>
    </Box>
  );
};

export default Loader;
