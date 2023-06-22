"use client";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import moment from "moment";
import { FC, memo, useState } from "react";
import { Stock, StockAction } from "redux/stock/stock.api";
import DeleteIcon from "@mui/icons-material/Delete";
import { Stack, Tooltip } from "@mui/material";
import {
  Edit as EditIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";

type Props = {
  row: Stock;
};

const StockTableRow: FC<Props> = ({ row }) => {
  const [open, setOpen] = useState(false);

  const router = useRouter();

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
        <TableCell component="th" scope="row">
          {row.name}
        </TableCell>
        <TableCell>{row.quantity}</TableCell>
        <TableCell>{row?.device?.name}</TableCell>
        <TableCell>
          {row.last_add
            ? moment(row.last_add).format("LLL")
            : "Данные отсутствуют"}
        </TableCell>
        <TableCell>
          {row.last_sub
            ? moment(row.last_sub).format("LLL")
            : "Данные отсутствуют"}
        </TableCell>
        <TableCell>
          {row?.taken ?? 0}/{row?.given ?? 0}
        </TableCell>
        <TableCell sx={{ maxWidth: 200 }}>{row?.description}</TableCell>
        <TableCell>
          <Stack direction="row" spacing={1}>
            <Tooltip title="Записать приход">
              <IconButton
                onClick={() =>
                  router.push(
                    `/stock/?modalType=stock&type=add&stockId=${row.id}`
                  )
                }
                aria-label="delete"
                color="primary"
              >
                <AddIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Записать списание">
              <IconButton
                onClick={() =>
                  router.push(
                    `/stock/?modalType=stock&type=sub&stockId=${row.id}`
                  )
                }
                aria-label="delete"
                color="error"
              >
                <RemoveIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Редактировать">
              <IconButton
                onClick={() =>
                  router.push(
                    `/stock/?modalType=stock&type=edit&stockId=${row.id}`
                  )
                }
                color="info"
                aria-label="add an alarm"
              >
                <EditIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h5" gutterBottom component="div">
                История изменений
              </Typography>
              {row.logs.length ? (
                <Table size="small" aria-label="purchases">
                  <TableHead>
                    <TableRow>
                      <TableCell>Описание</TableCell>
                      <TableCell>Изменение</TableCell>
                      <TableCell>Автор</TableCell>
                      <TableCell>Дата</TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {row.logs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell component="th" scope="row">
                          {log.description}
                        </TableCell>
                        <TableCell align="right">
                          {StockAction[log.type]}
                          {log.amount}
                        </TableCell>
                        <TableCell align="right">{log.author}</TableCell>
                        <TableCell>
                          {moment(log.created_at).format("LLL")}
                        </TableCell>
                        <TableCell>
                          <Tooltip title="Удалить запись">
                            <IconButton
                              onClick={() =>
                                router.push(
                                  `/stock/?modalType=stock&type=delete&logId=${log.id}`
                                )
                              }
                              color="error"
                              aria-label="delete"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <Typography variant="h6" gutterBottom component="div">
                  История отсутствует
                </Typography>
              )}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

export default memo(StockTableRow);
