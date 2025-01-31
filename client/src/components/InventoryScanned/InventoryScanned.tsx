import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import {
  Box,
  CircularProgress,
  IconButton,
  Modal,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import Item from "components/Item/Item";
import { Dispatch, SetStateAction } from "react";
import { useGetInventoryScannedQuery } from "redux/inventory/inventory.api";
import Row from "./TableRow";

type Props = {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
};

const InventoryScanned = ({ open, setOpen }: Props) => {
  const { data: scanned, isLoading } = useGetInventoryScannedQuery();

  return (
    <>
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
              История сканирований инвентаризации
            </Typography>
            <IconButton onClick={() => setOpen(false)}>
              <CloseOutlinedIcon />
            </IconButton>
          </Box>
          {isLoading ? (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              minHeight="100vh"
            >
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper}>
              <Table
                sx={{ minWidth: 650 }}
                stickyHeader
                aria-label="a dense table"
              >
                <TableHead>
                  <TableRow>
                    <TableCell>№ п/п</TableCell>
                    <TableCell>Инвентарный номер</TableCell>
                    <TableCell>Наименование/модель</TableCell>
                    <TableCell>Статус сканирования</TableCell>
                    <TableCell>Позиция в ведомости / Ведомость</TableCell>
                    <TableCell>Дата сканирования</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {scanned?.map((row, index) => (
                    <Row item={row} key={index} />
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </Modal>
      <Item />
    </>
  );
};

export default InventoryScanned;
