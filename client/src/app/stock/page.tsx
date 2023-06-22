"use client";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import {
  Autocomplete,
  Box,
  Button,
  FormControl,
  InputAdornment,
  OutlinedInput,
  TextField,
} from "@mui/material";
import AlertDialog from "components/Dialog/Dialog";
import StockItem from "components/Item/StockItem";
import StockLogItem from "components/Item/StockLog";
import StockTable from "components/Table/Stock/StockTable";
import { useDebounce } from "hooks/debounce";
import moment from "moment";
import { useRouter, useSearchParams } from "next/navigation";
import { enqueueSnackbar } from "notistack";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useGetCatalogsQuery } from "redux/catalog/catalog.api";
import {
  useDeleteLogMutation,
  useGetStockItemsQuery,
} from "redux/stock/stock.api";
import { ItemNames } from "src/constants/translations";

type StockFields = {
  q: string;
  device_id: number;
  period: Date;
};

const PeriodOptions = [
  { value: moment([1970, 1, 1]).toDate(), label: "За все время" },
  { value: moment().subtract(3, "months").toDate(), label: "3 месяца" },
  // { value: moment().subtract(1, "hours").toDate(), label: "3 месяца" },
  { value: moment().subtract(6, "months").toDate(), label: "6 месяцев" },
  { value: moment().subtract(1, "years").toDate(), label: "1 год" },
];

export default function Home() {
  const methods = useForm<StockFields>();

  const searchParams = useSearchParams();

  const [deleteLog] = useDeleteLogMutation();

  const logId = +searchParams.get("logId");
  const type = searchParams.get("type");
  const modalType = searchParams.get("modalType");

  const { q, ...values } = useWatch({
    control: methods.control,
  });

  const debouncedSearchQuery = useDebounce(q, 500);

  const { data: stocks } = useGetStockItemsQuery({
    q: debouncedSearchQuery,
    ...values,
  });
  const { data: catalogs } = useGetCatalogsQuery();

  const router = useRouter();

  const handleLogDelete = async () => {
    try {
      await deleteLog(logId).unwrap();

      router.back();
      enqueueSnackbar(`Успешно удалена запись`, {
        variant: "success",
      });
    } catch (e) {}
  };

  return (
    <>
      <Box
        sx={{
          position: "sticky",
          top: 0,
          pt: 1,
          zIndex: 15,
          backgroundColor: "white !important",
          alignItems: "center",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "flex-end",
            gap: 2,
            mb: 1,
          }}
        >
          <Controller
            name={"device_id"}
            control={methods.control}
            render={({ field: { onChange, value } }) => (
              <FormControl>
                <Autocomplete
                  sx={{ width: "300px" }}
                  disablePortal
                  //@ts-ignore
                  value={value || undefined}
                  onChange={(e, value) => onChange(value?.id ?? undefined)}
                  options={catalogs?.stock_device ?? []}
                  getOptionLabel={(option) => option.name}
                  renderInput={(params) => (
                    <TextField {...params} label={ItemNames.device} />
                  )}
                />
              </FormControl>
            )}
          />
          <Controller
            name={"period"}
            control={methods.control}
            render={({ field: { onChange, value } }) => (
              <FormControl>
                <Autocomplete
                  sx={{ width: "300px" }}
                  disablePortal
                  //@ts-ignore
                  value={value}
                  onChange={(e, value) => onChange(value?.value ?? undefined)}
                  options={PeriodOptions}
                  getOptionLabel={(option) => option.label}
                  renderInput={(params) => (
                    <TextField {...params} label="Период" />
                  )}
                />
              </FormControl>
            )}
          />
        </Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 1,
          }}
        >
          <Controller
            name="q"
            control={methods.control}
            render={({ field: { onChange, value } }) => (
              <FormControl fullWidth variant="standard" sx={{ mr: 1 }}>
                <OutlinedInput
                  id="q"
                  placeholder="Поиск..."
                  startAdornment={
                    <InputAdornment position="start">
                      <SearchOutlinedIcon />
                    </InputAdornment>
                  }
                  value={value}
                  inputProps={{ style: { padding: "7.5px 3px" } }}
                  onChange={onChange}
                  fullWidth
                />
              </FormControl>
            )}
          />

          <Button
            variant="contained"
            startIcon={<AddCircleOutlineOutlinedIcon />}
            onClick={() => router.push(`/stock/?modalType=stock&type=create`)}
            sx={{ py: "6px", width: 300 }}
          >
            Создать позицию
          </Button>
        </Box>
      </Box>

      <StockTable stocks={stocks} />
      <StockItem />
      <StockLogItem />
      <AlertDialog
        text={`Удалить запись в журнале?`}
        confirmAction={handleLogDelete}
        confirmText="Да, удалить"
        handleClose={router.back}
        open={modalType === "stock" && type === "delete"}
      />
    </>
  );
}
