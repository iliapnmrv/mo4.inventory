import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import {
  Box,
  Collapse,
  IconButton,
  TableCell,
  TableRow,
  Typography,
} from "@mui/material";
import { MemoTable } from "components/Table/Table";
import { FC, useState } from "react";
import { ReportItem } from "redux/inventory/inventory.api";

type Props = {
  row: ReportItem;
};

const Row: FC<Props> = ({ row }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <TableRow sx={{ "& > *": { borderBottom: "unset" } }}>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell>{row.vedpos}</TableCell>
        <TableCell>{row.place}</TableCell>
        <TableCell component="th" scope="row">
          {row.name}
        </TableCell>
        <TableCell align="right">
          <span title="Не найдено по позиции">{row.not_found}</span> /{" "}
          <span title="Количество в наличии">{row._count}</span>
        </TableCell>
        <TableCell align="right">
          <span title="Остаток по позиции">{row.remainder}</span> /{" "}
          <span title="Всего числится">{row.kolvo}</span>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                Ненайденные QR коды
              </Typography>
              <MemoTable
                showPlace
                showCheckboxes={false}
                data={row.items.map((item) => item.item)}
              />
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

export default Row;
