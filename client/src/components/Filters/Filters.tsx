import {
  Autocomplete,
  Box,
  Button,
  FormControl,
  Skeleton,
  TextField,
} from "@mui/material";
import { PropsWithChildren, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { useGetCatalogsQuery } from "redux/catalog/catalog.api";
import { IQuery } from "redux/item/item.api";
import { useGetStockItemsQuery } from "redux/stock/stock.api";
import Select from "./Select";

type Props = {
  onSubmit: (data: Filters) => void;
};

export type Filters = IQuery;

const Filters = ({ onSubmit, children }: PropsWithChildren<Props>) => {
  const [stockQuery, setStockQuery] = useState<string>("");

  const { data: catalogs } = useGetCatalogsQuery();
  const { data: stockItems, isLoading: isStockLoading } = useGetStockItemsQuery(
    {
      q: stockQuery,
    }
  );

  const { watch, control, setValue, handleSubmit, reset } =
    useFormContext<Filters>();

  return (
    <Box
      sx={{
        width: 280,
        display: "grid",
        gap: 2,
      }}
    >
      <Select
        catalogs={catalogs}
        catalog={"device"}
        name="device_id"
        control={control}
        multiple
      />
      <Select
        catalogs={catalogs}
        catalog={"person"}
        name="person_id"
        control={control}
      />
      <Select
        catalogs={catalogs}
        catalog={"status"}
        name="status_id"
        control={control}
        multiple
      />
      <Select
        catalogs={catalogs}
        catalog={"user"}
        name="user_id"
        control={control}
      />
      <Select
        catalogs={catalogs}
        catalog={"place"}
        name="place_id"
        control={control}
      />
      {isStockLoading ? (
        <Box>
          <Skeleton variant="text" sx={{ fontSize: "2rem" }} />
        </Box>
      ) : null}

      {stockItems?.length ? (
        <Controller
          name={"stock_item"}
          control={control}
          render={({ field: { onChange, value } }) => (
            <FormControl fullWidth>
              <Autocomplete
                //@ts-ignore
                value={value}
                options={stockItems.map((item) => ({
                  value: item.id,
                  label: item.name,
                }))}
                onChange={(e, value) => onChange(value?.value)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    onChange={(e) => setStockQuery(e.target.value)}
                    label="Позиция со склада"
                    InputProps={{
                      ...params.InputProps,
                    }}
                  />
                )}
              />
            </FormControl>
          )}
        />
      ) : null}

      <Button fullWidth variant="contained" onClick={handleSubmit(onSubmit)}>
        Найти
      </Button>
      {/* <Button
        variant="text"
        onClick={() => {
          setFilters({});
          hideFilters();
          onSubmit({});
          reset({ device_id: [] });
          reset({ q: "" });
        }}
      >
        Сбросить фильтры
      </Button> */}

      {children}
    </Box>
  );
};

export default Filters;
