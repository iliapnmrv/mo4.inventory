import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import moment from "moment";
import React from "react";
import { ILog } from "redux/item/item.api";

type Props = {
  logs: ILog[] | undefined;
};

const LogsTable = ({ logs }: Props) => {
  return (
    <TableContainer component={Paper} sx={{ mt: 2, maxHeight: "500px" }}>
      <Table aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>№</TableCell>
            <TableCell>Описание</TableCell>
            <TableCell>Дата создания</TableCell>
            <TableCell>Исполнитель</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {logs?.map((log, index) => (
            <TableRow
              key={log.id}
              sx={{
                "&:last-child td, &:last-child th": {
                  border: 0,
                },
              }}
            >
              <TableCell>{index + 1}.</TableCell>
              <TableCell>{log.description}</TableCell>
              <TableCell>{moment(log.created_at).format("LLL")}</TableCell>
              <TableCell>{log.author}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default LogsTable;
