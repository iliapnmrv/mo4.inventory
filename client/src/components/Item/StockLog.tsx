"use client";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import {
  Box,
  Button,
  IconButton,
  Modal,
  TextField,
  Typography,
} from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import { enqueueSnackbar } from "notistack";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  StockLog,
  useLazyGetStockItemQuery,
  useLogStockMutation,
} from "redux/stock/stock.api";
import { convertIntObj } from "src/utils/utils";

type StockLogFields = Pick<StockLog, "amount" | "description">;

const StockLogItem = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const id = +searchParams.get("stockId");
  //@ts-ignore
  const type: "add" | "sub" = searchParams.get("type");
  const modalType = searchParams.get("modalType");

  const [logStock] = useLogStockMutation();
  const [getStock, { data: item }] = useLazyGetStockItemQuery();

  const handleStockClose = () => {
    router.back();
  };

  const findStock = async (id: number) => getStock(id);

  useEffect(() => {
    if (id) {
      findStock(id);
    }
  }, [id]);

  const { control, reset, handleSubmit } = useForm<StockLogFields>();

  useEffect(() => {
    reset({});
  }, [modalType, type]);

  const onSubmit = async (values: StockLogFields) => {
    try {
      await logStock({ ...convertIntObj(values), id, type }).unwrap();
      reset({});
      enqueueSnackbar(`Успешно сохранено`, {
        variant: "success",
      });
      router.back();
    } catch (e) {
      enqueueSnackbar(`Произошла ошибка`, {
        variant: "error",
      });
    }
  };

  return (
    <Modal
      open={modalType === "stock" && (type === "add" || type === "sub")}
      sx={{ overflowY: "scroll" }}
      onClose={handleStockClose}
      keepMounted={false}
      disableScrollLock
    >
      <Box
        sx={{
          top: "25%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "50%",
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
          <Typography variant="h4" gutterBottom>
            {type === "add" ? `Поступление` : type === "sub" ? `Выдача` : null}{" "}
            {item?.name}
          </Typography>
          <IconButton onClick={handleStockClose}>
            <CloseOutlinedIcon />
          </IconButton>
        </Box>
        <Box
          sx={{
            gap: 2,
            display: "grid",
          }}
        >
          <Controller
            name="amount"
            control={control}
            rules={{
              required: "Поле обязательно",
            }}
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <TextField
                required
                type="number"
                value={value ?? ""}
                fullWidth
                onChange={onChange}
                label={`Укажите количество ${
                  type === "add" ? "поступивших" : "выданых"
                } элементов`}
                variant="outlined"
                helperText={error?.message}
              />
            )}
          />
          <Controller
            name="description"
            control={control}
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <TextField
                value={value ?? ""}
                fullWidth
                id="description"
                onChange={onChange}
                label={"Примечание (не обязательно)"}
                variant="outlined"
                helperText={error?.message}
                autoComplete="true"
              />
            )}
          />
          <Button variant="contained" onClick={handleSubmit(onSubmit)}>
            Сохранить
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default StockLogItem;
