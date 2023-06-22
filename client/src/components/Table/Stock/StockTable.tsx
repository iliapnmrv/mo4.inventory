"use client";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { FC } from "react";
import { Stock } from "redux/stock/stock.api";
import StockTableRow from "./StockTableRow";

type Props = {
  stocks: Stock[] | undefined;
};

const StockTable: FC<Props> = ({ stocks }) => {
  return (
    <>
      <TableContainer component={Paper}>
        <Table
          sx={{ width: "100%" }}
          size="small"
          aria-label="collapsible table"
        >
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell>Наименование</TableCell>
              <TableCell>Количество</TableCell>
              <TableCell>Тип устройства</TableCell>
              <TableCell>Дата последнего прихода</TableCell>
              <TableCell>Дата последнего расхода</TableCell>
              <TableCell>Статистика за период (пришло/выдано)</TableCell>
              <TableCell>Описание</TableCell>
              <TableCell>Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {stocks?.map((row) => (
              <StockTableRow key={row.id} row={row} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default StockTable;
