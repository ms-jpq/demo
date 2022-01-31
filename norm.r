#!/usr/bin/env Rscript

mean <- 0
sd <- 1

boundary <- 2
reps <- 100
gen <- seq(from=-boundary, to=boundary, by=boundary/reps)

pdf <- dnorm(gen, mean=mean, sd=sd)
cdf <- pnorm(gen, mean=mean, sd=sd)
cdf_inv <- qnorm(seq(from=0, to=1, by=1/reps), mean=mean, sd=sd)

out <- function(col, file) {
  write.table(col, file = file, col.names = FALSE, row.names = FALSE)
}

out(pdf, file = "./tmp/pdf.csv")
out(cdf, file = "./tmp/cdf.csv")
out(cdf_inv, file = "./tmp/cdf_inv.csv")
