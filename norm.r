#!/usr/bin/env Rscript

if (!require(sn)) {
  install.packages("sn")
  library(sn)
}

mean <- as.numeric(Sys.getenv("mean"))
sd <- as.numeric(Sys.getenv("mean"))
alpha <- as.numeric(Sys.getenv("alpha"))

boundary <- as.numeric(Sys.getenv("boundary"))
reps <- as.numeric(Sys.getenv("reps"))
gen <- seq(from = -boundary, to = boundary, by = boundary / reps)

pdf <- dnorm(gen, mean = mean, sd = sd)
cdf <- pnorm(gen, mean = mean, sd = sd)
cdf_inv <- qnorm(seq(from = 0, to = 1, by = 1 / reps), mean = mean, sd = sd)

s_pdf_0 <- dsn(gen, tau = mean, omega = sd, alpha = 0)
s_pdf_a <- dsn(gen, tau = mean, omega = sd, alpha = alpha)

tmp <- "tmp"
dir.create(tmp)
out <- function(col, file) {
  write.table(
    col,
    file = file.path(tmp, file),
    col.names = FALSE,
    row.names = FALSE
  )
}

out(pdf, file = "pdf.csv")
out(cdf, file = "cdf.csv")
out(cdf_inv, file = "cdf_inv.csv")
out(s_pdf_0, file = "s_pdf_0.csv")
out(s_pdf_a, file = "s_pdf_a.csv")
