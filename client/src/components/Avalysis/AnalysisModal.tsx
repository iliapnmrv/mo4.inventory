import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import InventoryOutlinedIcon from "@mui/icons-material/InventoryOutlined";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import SpeakerNotesOffOutlinedIcon from "@mui/icons-material/SpeakerNotesOffOutlined";
import {
  Box,
  IconButton,
  Modal,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import React, { Dispatch, SetStateAction } from "react";
import { useGetAnalysisAllQuery } from "redux/inventory/inventory.api";

type Props = {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
};

const AnalysisModal = ({ open, setOpen }: Props) => {
  const { data: analysis } = useGetAnalysisAllQuery();

  const [filter, setFilter] = React.useState<string>("all");

  const handleFilter = (
    event: React.MouseEvent<HTMLElement>,
    newFilter: string | null
  ) => {
    if (newFilter !== null) {
      setFilter(newFilter);
    }
  };

  return (
    <Modal
      open={open}
      sx={{ overflowY: "scroll" }}
      onClose={() => setOpen(false)}
      disableScrollLock
    >
      <Box
        sx={{
          //   top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "80%",
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
          borderRadius: 1,
          position: "absolute" as "absolute",
          zIndex: 100,
          "@media(max-height: 1440px)": {
            // top: 10,
            transform: "translate(-50%, 0%)",
          },
        }}
      >
        <Box
          sx={{
            flexDirection: "row",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <Typography variant="h5" gutterBottom>
            Анализ
          </Typography>
          <IconButton onClick={() => setOpen(false)}>
            <CloseOutlinedIcon />
          </IconButton>
        </Box>

        <ToggleButtonGroup
          sx={{ mb: 1 }}
          value={filter}
          exclusive
          onChange={handleFilter}
        >
          <ToggleButton value="all">
            <Tooltip title="Все данные">
              <Inventory2OutlinedIcon />
            </Tooltip>
          </ToggleButton>
          <ToggleButton value="listed">
            <Tooltip title="Не хватает">
              <ShoppingCartOutlinedIcon />
            </Tooltip>
          </ToggleButton>
          <ToggleButton value="in_stock">
            <Tooltip title="Лишнее">
              <InventoryOutlinedIcon />
            </Tooltip>
          </ToggleButton>
          <ToggleButton value="not_listed">
            <Tooltip title="Не в учете">
              <SpeakerNotesOffOutlinedIcon />
            </Tooltip>
          </ToggleButton>
        </ToggleButtonGroup>
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} stickyHeader aria-label="a dense table">
            <TableHead>
              <TableRow>
                <TableCell>Наименование</TableCell>
                <TableCell align="right">В наличии</TableCell>
                <TableCell align="right">Числится</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {analysis
                ?.filter((item) => {
                  if (filter === "all") return true;
                  if (filter === "listed") {
                    return item.listed > item.in_stock || !item.in_stock;
                  }
                  if (filter === "not_listed") {
                    return !item.hasOwnProperty("listed");
                  }
                  if (filter === "in_stock") {
                    return item.in_stock > item.listed;
                  }
                })
                ?.map((row) => (
                  <TableRow
                    key={row.name}
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      {row.name}
                    </TableCell>
                    <TableCell align="right">{row.in_stock ?? 0}</TableCell>
                    <TableCell align="right">{row.listed ?? 0}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Modal>
  );
};

export default AnalysisModal;
