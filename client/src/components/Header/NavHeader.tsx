"use client";
import { Box, Button, Stack, Typography } from "@mui/material";
import Link from "next/link";
import React, { PropsWithChildren } from "react";

const NavHeader = ({ children }: PropsWithChildren) => {
  return (
    <>
      <Stack
        sx={{
          height: 80,
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          width: "1300px",
          margin: "0px auto",
          position: "sticky",
          top: 0,
          zIndex: 4,
          backgroundColor: "white",
        }}
        direction="row"
        spacing={2}
      >
        <Link href="/">
          <Typography variant="h4">Инвентаризация 2.0</Typography>
        </Link>
        <Link href="/">
          <Button variant="text">Докуметооборот</Button>
        </Link>
        <Link href="/inventory">
          <Button variant="text">Инвентаризация</Button>
        </Link>
        <Link href="/catalogs">
          <Button variant="text">Справочники</Button>
        </Link>
        <Link href="/stock">
          <Button variant="text">Склад</Button>
        </Link>
      </Stack>
      <Box
        sx={{
          maxWidth: "1300px",
          margin: "0px auto",
        }}
      >
        {children}
      </Box>
    </>
  );
};

export default NavHeader;
