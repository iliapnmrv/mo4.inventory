import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
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
  Typography,
} from "@mui/material";
import Item from "components/Item/Item";
import { useActions } from "hooks/actions";
import { Dispatch, SetStateAction } from "react";
import { IItem } from "redux/item/item.api";

type Props = {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  items: IItem[];
};

const NotAvailableModal = ({ open, setOpen, items }: Props) => {
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
              Остаток по позиции не равен 0
            </Typography>
            <IconButton onClick={() => setOpen(false)}>
              <CloseOutlinedIcon />
            </IconButton>
          </Box>

          <TableContainer component={Paper}>
            <Table
              sx={{ minWidth: 650 }}
              stickyHeader
              aria-label="a dense table"
            >
              <TableHead>
                <TableRow>
                  <TableCell>№</TableCell>
                  <TableCell>QR</TableCell>
                  <TableCell align="right">
                    Наименование по бух. учету
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items
                  ? items?.map((row, index) => (
                      <TableRow
                        key={row.qr}
                        sx={{
                          "&:last-child td, &:last-child th": { border: 0 },
                        }}
                      >
                        <TableCell component="th" scope="row">
                          {index + 1}
                        </TableCell>
                        <TableCell>{row.qr ?? row.id}</TableCell>
                        <TableCell align="right">{row.name}</TableCell>
                      </TableRow>
                    ))
                  : null}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Modal>
      <Item />
    </>
  );
};

export default NotAvailableModal;
