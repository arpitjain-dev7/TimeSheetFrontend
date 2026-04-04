import { Box, Button, Typography } from "@mui/material";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        mt: 3,
      }}
    >
      <Button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 0}
        variant="outlined"
        size="small"
        sx={{ borderRadius: 2 }}
      >
        ← Previous
      </Button>

      <Typography variant="body2" color="text.secondary">
        Page <strong>{currentPage + 1}</strong> of <strong>{totalPages}</strong>
      </Typography>

      <Button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages - 1}
        variant="outlined"
        size="small"
        sx={{ borderRadius: 2 }}
      >
        Next →
      </Button>
    </Box>
  );
};

export default Pagination;
