import {
  Paper,
  Skeleton,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  Table as TableMUI,
  TableRow,
} from "@mui/material";
import React from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { IItem, useLazyGetItemQuery } from "redux/item/item.api";
import { ItemNames } from "src/constants/translations";
import Row from "./Row";

type Props = {
  data: IItem[] | undefined;
  showPlace?: boolean;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  fetchNextPage?: () => void;
  showCheckboxes?: boolean;
  isLoading?: boolean;
};

const Table = ({
  data,
  showPlace,
  hasNextPage,
  fetchNextPage,
  isFetchingNextPage,
  showCheckboxes = true,
  isLoading,
}: Props) => {
  return (
    <InfiniteScroll
      loader={<h4>Загрузка новых позиций...</h4>}
      hasMore={hasNextPage}
      dataLength={data.length}
      next={() => {
        if (isFetchingNextPage) {
          return;
        }
        return fetchNextPage();
      }}
    >
      <TableContainer component={Paper}>
        <TableMUI sx={{ width: 1000 }} stickyHeader size="small">
          <TableHead>
            <TableRow>
              {showCheckboxes ? <TableCell></TableCell> : null}
              <TableCell> {ItemNames.qr}</TableCell>
              <TableCell>
                {showPlace ? ItemNames.place : ItemNames.name}
              </TableCell>
              <TableCell>{ItemNames.model}</TableCell>
              <TableCell>{ItemNames.device}</TableCell>
              <TableCell>{ItemNames.person}</TableCell>
              <TableCell>{ItemNames.status}</TableCell>
              <TableCell>{ItemNames.user}</TableCell>
              {/* <TableCell></TableCell> */}
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading
              ? [...Array(10)].map((_, index) => (
                  <TableRow key={index}>
                    {[...Array(8)].map((_, index) => (
                      <TableCell key={index}>
                        <Skeleton variant="rectangular" sx={{ my: 2 }} />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : data?.length
              ? data.map((item) => (
                  <Row
                    showPlace={showPlace}
                    item={item}
                    key={item.id}
                    showCheckboxes={showCheckboxes}
                  />
                ))
              : "Данные не найдены"}
          </TableBody>
        </TableMUI>
      </TableContainer>
    </InfiniteScroll>
  );
};

export const MemoTable = Table;
