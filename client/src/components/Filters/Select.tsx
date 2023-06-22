import { Autocomplete, FormControl, TextField } from "@mui/material";
import { memo } from "react";
import { Control, Controller } from "react-hook-form";
import { Filters } from "./Filters";
import { ICatalog, ICatalogs } from "redux/catalog/catalog.api";
import { ItemNames } from "src/constants/translations";

type Props = {
  name: keyof Filters;
  control: Control<Filters, any>;
  catalogs: Record<ICatalogs, ICatalog[]>;
  catalog: ICatalogs;
  multiple?: boolean;
};

const Select = ({
  name,
  control,
  catalogs,
  catalog,
  multiple = false,
}: Props) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, value } }) => (
        <FormControl fullWidth>
          <Autocomplete
            disablePortal
            //@ts-ignore
            value={value || undefined}
            onChange={(e, value) => onChange(value?.id ?? undefined)}
            options={catalogs?.[catalog] ?? []}
            getOptionLabel={(option) => option.name}
            renderInput={(params) => (
              <TextField {...params} label={ItemNames[catalog]} />
            )}
          />
        </FormControl>
      )}
    />
  );
};

export default memo(Select);
