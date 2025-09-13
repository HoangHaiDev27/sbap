import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  RiGridLine,
  RiListCheck,
  RiHeadphoneLine,
  RiTimeLine,
  RiStarFill,
  RiStarLine,
  RiPlayCircleLine,
  RiHeartLine,
  RiHeartFill
} from "react-icons/ri";

export default function AudiobookGrid({ selectedCategory, selectedDuration }) {
  const [viewMode, setViewMode] = useState("grid"); // 👉 thêm state để đổi chế độ
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 2;
  
 
  const audiobooks = [
    {
      id: 1,
      title: "Đắc Nhân Tâm",
      author: "Dale Carnegie",
      narrator: "Nguyễn Minh Hoàng",
      category: "Tâm lý học",
      rating: 4.8,
      reviews: 1205,
      price: 89000,
      duration: "7h 30m",
      chapters: 18,
      image:
        "https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcT5IqSs9SV7eTNQiNZSXsScSZXlw04fmXrMroTGQ6Q-bObZ_ZK_EBsPSrQzXXTklzyOi1JblhROK86yhNtJNJk6NG_rd41i7v-r4KhnSY2kuFSb0D3XZtcM&usqp=CAc",
      description:
        "Cuốn sách kinh điển về nghệ thuật giao tiếp và ảnh hưởng đến người khác.",
    },
    {
      id: 2,
      title: "Tôi Thấy Hoa Vàng Trên Cỏ Xanh",
      author: "Nguyễn Nhật Ánh",
      narrator: "Trần Thị Lan",
      category: "Văn học",
      rating: 4.9,
      reviews: 2150,
      price: 75000,
      duration: "6h 15m",
      chapters: 15,
      image:
        "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxMSEhUTExMWFhUXGB0bGBgYGR4aGhoaGxoaGh4aGxodHyggGholHRsaIjEhJSorLi4vGh8zODMtNygtLisBCgoKDg0OGxAQGy8lICYyLi04Ly8wLzItLjArLS01MC0vLS0yLS0vLystLS8vLy0tLS0tLy0tLS0tLy0tLS0tLf/AABEIAOEA4QMBEQACEQEDEQH/xAAbAAACAwEBAQAAAAAAAAAAAAAABAIDBQYBB//EAEMQAAECBQIDBgQEBAQEBgMAAAECEQADBCExEkEFUWEGEyJxgZEyobHwFFLB0SNCcuEVM2LxgpKywgdTY6Kz0hYkVP/EABoBAAIDAQEAAAAAAAAAAAAAAAAEAgMFAQb/xAA5EQABBAAEAwYFBAEEAgMBAAABAAIDEQQSITFBUfAFEyJhcYGRobHB0RQy4fEzIzRCUgYVU2LCgv/aAAwDAQACEQMRAD8A5GJLyqIEIgQiBCIEIgQiBCIEIgQiBCIEJjh9GqdMEtJAUcOFH5JBPygUmMzmgqp8rSopcFixZ8jOQD8oFxwymlCOqK0+zdEifUy5UzVpWWOkgHBO4Nrf3jiugY17w1yy0XbrAqq1TtXwyZLUEkaiUFfhuGSDruPyFKgrlpO14FY6JzTSpo6YzFpQCATuoslIFypR2SACSeQMCixpcaCqI6v99YFFaMyjR+EROGrWZypZcgpZKEqBAYEfFuTiBXFje6D+N0s2BUogQiBCIEIgQiBCIEIgQiBCIEIgQiBCIEIgQiBCIELX7Ny0KM/XLSvTTTVAKeykpcEMRf7DQFMYYAl1i9CtahpEVMhMwSpYnpE9KEoSEiatCZK0OgWUsJXMLN4tIBeOK9jRIwOoXqpoEtclSVyJSZyaSauY0vQpKkzAlCtIYIUUXIAGQdxHF0BrmGwLoqPCUSlyqVC5coKnmok6yhLhYEoSVO2QtTdQou5aOrkWUtaCBrY/CplU6UUiisJTMlmWFnukrI73vFALBYKGlCG1OHmFw4SwUBobHruPupcQq5Bp/wARJkI19+hJK0AjV3JKwlBUpOgqDhJw+LBhD3syZ2t4/ZSlUso8QSO5R3cyQJndsdKVKpe+8IewC8DYR1GRvf7aEX8kx2UKZn4aZ3ctK0VQlgoTp1IVJmKZTfEQUWUb3N4ip4engOoWDXyWZwyWKimLU6DMlTpIQJadClpmCYDLUoXUPADqJ1C946FU0CRh8OoI2WrwlQTJE3RIMzuKxKihCdKhLkoWnUEgIJ8ZBKXcM5MB2V0ZoXQunfKlh8JUoqE3upOkzQlRWkGXcf5aUNki/hGoWxuJaKyc1Cr9vRPcZ7ulSDLkSSU1VVLeYnXqRLVL0hQUSDZRD55MXJAVZJlirK0blNcfCaaXMTLloKU1szSlaQsJBkyVNpVYi7XBt7xxTmqJpyj/AJfZYXamQhFUsS0hCSJawkYT3kpEwgdHUWHKJBK4lobIQFlR1UIgQiBCIEIgQiBCIEIgQiOIRAhECEQIRAhECEQITNDXzJOoyyBrSUKdCVuk2I8QLA9IFNkjmbLa7L1U5QUhARM7lKpkuQZaCZilaUKY6dZOg6iAdRCGHMcKYw73VQ1rWq3XtRXmSgTBIRTVOopKUpUErkqQQrXJmlQZ2HIufywALrpMgzAZXfb0StHVzJ7CapIkyHmnShCCm6fCgpSNJWrQkAWcgtYmOkKDJHP/AHHQa9eqWlccnpmTZoWNU4nvAUpWheo6iChYKSHxa0FKsTvDi4HdQn8XnLl90pSdGoK0iXLAChYMyRpDWYMLm14EGZ5GU7eimnjk8TBNCk94lGgHupdk6dDadGn4fC7O1oKR3782bjtsih45PkgCWpKQF6x/DlllsRqBKCbBRHQGCl1mIe0UPovKHjU+SCJSgh1pWWlo+JDlJB02ZywFrm14KXGzvb+31TUztHNGkSyAm5UlUqSRrWnTMCQJYAlqFtG+S5vBSmcS7/j9vdJyeLzkJUlKkhKlBZHdoYLTYKQNP8NQBZ0tHaVYmeFOv43OnMJhQQFldpUpPjU2onSgPqYO7u13jlLr53v39dgiu45PnApmKSoFes/w5YdbAanCAcADq0ACHzveKP0S9fXTJ69cwgqYBwlKbJASLJABYADyAjoUXyOebclo6q0QLqIEK2pply1FExKkKDOlQINw4seYIMctdc0tNEKqOqKIF1ECEQIREUIgQiBCIEIgQiBCIEIgQgQI2QTHQgm90R1CIEIgQiBCIEIgQiBCnJlKWQlCSpRwlIJJ8gLmOFdDSTQXW9reATQKbuaZelNHLVMUmWQNXjKtZb49y97xG09iYHeHK3go8T4JTpmU8sSKxGo6T/D8U4aX7xAWfCvUWKDhLHmCWiSBltAB/K5RaPEQkKyyQR4s2BA3iQSJHioLreJdnppoKISqWYZqlTzMaWdQ8YCddnHhAZ+URTz4HGFgDddUr234T3VRM7qUUyZQlS1KCfDr7pCrn8xdz53zHQVXi4sryWjQUPkjsvw+nXJmzJkqdMWkvqSgmXJShIXqmXAWFHwlAL6XIbMBK7h42FpLgb+QpZ9YKqtmieqWVKnzNCdIZJUAPAnkAls7C5zHFU8STOz1vosydKUhSkKDKSSlQ5EFiPeJqggg0VCBCIEIgQiIoRAhECEQIRAhECEQIRAhECER0IRHUIgQiBCIEIgQiBCIEKynqFy1BctakKGFJJSoWaxFxaBdDi02F2/EO1KTUcPWZ61y0SZPfpClEawTqKk4UsZO5YRClovxIzsN6ULWnP4/ToqKdBq+/H4xdQqYX0ykKQpKJYJ2DjFg2BHKVxnjDwM1636L51WTv4y1oJH8RSkkWI8RIIOQcRMLKe7xkjmuk4z2iXM4fSoFTMM4KmiaNatRBV4dd/ENLM8RpNyYgmFoza8V0najtNSVKKmlRMSlK5SZiZrFlTkkKKDazpSge4zAmpp4pA6O+F35piX2moKcyaaVN1SFo7tTAhMtJSp1rt4pq1lLvgA43F0YiFlMB0PwH9pDs9xqjkS6RImd7OkzFykoAIH8WcAqeSR/5fwj/URzbijFLEwNANkWPid1xXatLVtUP/XmfNZMTCzsSKld6rKjqpRAhECERFCIEIgQiBCIEIgQiBCIEIgQiOhCI6hECE9wOlE2okyzhUxIPk9/k8K46Yw4aSQbgH6K7DMzzNaeJCb7YSUIrJyUJCUhQYJDAeFJLDa7wt2NI+TBRuebJG/uVbj2tbiHBooLGjTSiIEIgQiBcRAuogQrqJCFTEpmLKEEgKUA+kc23iqZz2xudG23cBtanE1rngONDmn+OcCmUxSSUzJS/gmoLpV+x6exMKYHtGPFAgAtcN2ncK/E4V0FG7adiFlRoJVAgQuk4J2pRJlolzqSXUCUrVJUToWg6tTagDqTqu31s0SE3DiQxoDm3WyxOJVqp81c5bapiiosGDk4A5R0JV7y9xceKWjqiiBdRAhERQiBCIEIgQiBCIEIgQiBCIEIEdCER1CIELa7Fj/92R/Uf+lUZXbZrAS+n3Cd7O/3LF2dR2VRNTVzpiSZq1zDKLkaQkkJLPdyN9iI8xH20+B8EMZ8ADQ7zvf4fVbD+z2yCSRw8RuvZcz2Q4FJnIm1FQSJMrIBIctqLtdgCLC5J993tjtGaCRmHw48b+fD+1m4DCRyNdLL+0KfafhNMKaTV0oUmWtWkpUSb+K9ySCChQNyMevOy8bijiZMLiqLmi7Hty9V3G4eAQtmh0B0paXZ7sdKSZZq3MyYCUSQ4YAOSsi9rWsASBcloR7S7dlcHjCaNbu714BM4Ts2MZTNqTw/K57tlw5NPVrQgMggKSOQIuPJ3jY7Gxb8VhGyPNu1B9lndoQNhnLW7bo7IcJl1U8ypqlJGhRTpZyoEcwdiS3SO9sY6XB4cSxgHUXfJdwGHZPLkeeC1+x3AkJm1C6pKSimBBCg6SoO6mOQEh/+IGM3tntF7oYmYY06SjpvX9/RN4DCND3ulGjeaR4D2fTPSupnEyqZJJsHUq/wo9SEuxc2F8NY/tR2HLcNEM0pA9B5n6/NU4bBia5X6MB6paXb/gUqnlSVSUlA1FJDkuSHBuTfwm+/pCP/AI/2lNipZGzGzQOw5/RMdqYSOJjTGKT3BuB01FLk1c5RUpaUBKSAQFzGI0jmA9zyJ5Qpje0cVj5JMJAKAJs67N5+qvw+EhwzWzPNk1p5lZnangRm8T7qWw74Bb7JDEKV/wCwnqTGh2V2kIuy++k1yWPM8h80tjcIX4zI3/lqtjhfZmgmrmSUy5i+68K5xUQNf5UsQCRd7MLZeM3Fdr9oxMbK5zW59Q2ta5n+03DgcK8lgBNbm+K+cz0gKUA7AkB8s+/WPaRkloJ5LzsgDXEBQixRRAuogQiIoRAhECEQIRAhECEQIRAhECER0IRHUIgQtTsxWIk1UmZMLISoucs6Sl/IPGf2rA+fCSRx7kfcFNYKVsc7Xu2XYzu2soVwOomnEsoKgCRqJCitskWCfc3jzUf/AI/L/wCvqqlJzV5Dh68Vrv7UZ+p38FV/KT4JxGjl/iqNc3+BMUTLmAEBlJAKcWKWDEhix6OxjsJjZO5xjGf6jRRbpwO/vrYVWHmwze8gcfCdj1yVfE+O0qV0lPKdVNImBS1MbkHOHUzqJtd7RZhezsYWT4iXSV4IA5dbDkozYuAPjjZ+xptaHabtXIQFKpl6560hGsO0tAvZwzkkm29zgCEuy+xcQ+m4puWNpJri4+avxnaETLdCbcdL5BYnbXiVPVJkTpav42nTMQxsM32cKJHUGNXsTCYnCOkhkHguwefQ+aS7RnhnayRp8XELnuGVqpE2XNTlCgfMbj1Dj1jaxUDcRC6J2xFfz7LPhlMTw8cF2fbDtLTrpzLp1OqcoKmEAggAAMr/AFHSkNyB9fL9jdk4mPECTEjRgIb/AB5albXaGOidDliOrt05TdoqJFJIclSpSUkSQC5mJTk2ZtTqc2djkCFpOyu0H42UgUH34v8A6k8PbSvZWsxuGbh2WdRw81lT+0MuroZyKlbTkrK5bA3JcpAtgOpF8Bo0I+y5sHj45MM22EAH7/n1SrsYzEYZzZT4gbH2SvbHtBLqJdOiS/gS6nDMpkgJ6kMbi1w0Mdjdly4WSZ8teI6elnX3VWOxjJWMazh9Vp8W7VSRUUlUg6yJakzUCykgta9nBKj1bq8IYTsac4afCyaAkFp4afbZMzY+MSxyt101Wn2d7RS51SmTTyyiSErWp7FSyQXLE2Dne79BCPafZcsGEdNiHZn20DkAEzhMYyWbu4hTaJ91844h/mzP61f9Rj22H/ws9B9F52f/ACO9Sl4vVSIF1ECERFCIEIgQiBCIEIgQiBCIEIgQiOhCI6hECEQIRAhEcXER1C6HsbwKVWTTLmTVpV/KlEsqJsXWpXwoQLC+SRHCU1hYGSmiVgz5elSkuDpJDjBYs46GOpZzaJChAhECERykIgXER1dW72Hc10gAA6iUkEOGKVA/J4R7RwxxOHdG00TsfMJvAOyzt0XZTZVHQ1FRVd8jWxSJCdLpU4JASC9yBsAHMeXnPaOOYzCSxEUQS7hpx5flbIGGw0jpg72XzFaySSckufMx7RrQ0ADYLzbjZJK8iS4iBdRAhERQiBCIEIgQiBCIEIgQiBCIEKynp1zFBEtClqOEpBUo72AuYF1rS40F2XbDs3PJp+5pl6JdHL1kIbxDWVav9e5GbxwFP4nDvOXKNgFg8H7PTp3dLMuYJC5gR3iU6icvoTlVgbgEBi+DErS8WHc8gkaI7T0CJVR3cqXNQ4B7qYPGhRcaQQ+sYIUPzNkRwFcxEYa+mg+ijX9nKiRToqJqNCFq0gKcLdibpIsDpLeXlHbXH4d7GB7lRwLhaqqolyElitTPyABKj1ZIJaAlRhjMjw0Ld7c0NBTlMmlK1TkFpqiolNhg7a3/AChhcG8cBTGKZCyms3W3wjg1FR0kmfWd4pVUANKFqSAhbFlBKk6kgMVO92YRwlMxRRRRhz/+X3XM9vOBIoqsypZOhSQtINykFxpfdik+jRIFJ4uERSUNlLsb2aTX9+jvCiYhAVLTZlFyPF/pB0i35o4Su4bDibML1W1R9kJFJTKqeJvqNpchKmJOwJSbqPIFgLnoWr24VkTC+b4LN7KdlEzpSquqWZdMgt4R45qnbSj/AImTZyTYXuAlV4bCh4zv/b9Vrf8Aih2akUsuRMkS+7BJQoOS9tSSSSb2Vff0jgKtx2HYxrSwUtXgfZ+j4dLp6yepSpkwISlJAITMmMXSGDaQ9ybAHdoCVfFBHAA87n7qipoBK7RSmDCY8z1MqYD7qST6wKLmZcYPNOVXYqXMp66fNSe/XMnrlkk+EJWooAGGUA/koQKbsI0se4jU2vkkSCxUR1CIEIgQiIriGgRaIEIgQiOrqI4hECEQIRAhTkTlIUFIUpKhhSSQRtYi4gXQ4tNhdlxLtQn8TQTkzVrTKkye+DqPjBVrcH4lsc72vHKT78T/AKjCDpQte1va5A4mickaqWSDLloTZpZTpUpItckk7OABHaQ7FAThw/aNE3O4rQIqZM9U0TkyxKlyEJRMHcykKfvJpVdcxIJYDe7cuAKx0sOcPJvgPL1SfGe0supk16VTC6pyJlOFA3SCEEAfysgO1snrAFXLiGyMeCeOiw+x/F00lXKnrBKUkhTZZSSlx5O/pEilsNKIpA47Lta2s4EiYuoYz5i1Ffdssp1KLnwqZNyXZT+URT7n4Rpz7lMq7TcMrZcpVU8lUhepMplEMMB0pZSSAm1rhsZFL9RBKAX6VwXA9r+Ofjapc5iE2SgHIQnD9SXPrEgs7ETd6/MtfsRxOmopc2rmKK6i8uVJBaxAJUTsDhzhjkmOHdX4WSOJpkO+1J/tF2louI0pVOSZNXLB7sAFQV/pCgG0n/UxGz7lKybEQzx27RwWxJ7X8PRRU2VzJCUlEgAj+KlOl1FtJYknUXy7EgRyleMVC2Jvlw81h1XaiVWcNnSqtZFQlZXKZJ8RJJSBZgBqUi+EtBSoOJZLCRIdUr297US6tFKiTqAlIJU4ZlkJASOenSb4vaOgKvF4lsgaG8FtcR7VUi6+gqwv4UKTO8JeXqSQkG12UtWHsI5SYfiYjKx9+quV/wCIMr/ElEkmk7vunYm76jM05Z3TjDGBdOOZ33/1ql854tJlInTEyV65QUdCmIdO1je2H3Z46FlyhoecpsJSJKCIEIgQuiquFoXjwq+R8/3jKjxTm6HUK4sBWXMoSHBYEDGb8va8PNlDtQqe7I3T/DuAmYxNn2u7eTRVJiQ1OQYTO2ym0dk1khgWL3Fx/YxUcc0JhvZ1qmq7LzEB2JbPMdeoiTMa1x1UX9nloWWrhig/Q3bMXidpSxwrhxVquEkC502sTgnLdLRzvwpnCUNTSrTSITdawx+Fr6v/AK+sSL3EeEKDYmN1e5KzZJCiCPvZosBsWl3DKSE1SSwASRbmQ4F8G17XiqQmwAr4MmpKv4hw9KX0lJDtYtkOCAdoqhnc7dW4iFjdiFnCVvtv/tmGsySFbrVpOz6phACrsTh+XLzHvCUuObGLIWhH2eX7OV3Euy0yUl35O4055F2MVYbtSKY01Sm7MfGLtZE+gmIAUpCgk4LFveNBs0bjQOqSfBI0WQoJpy6QfDqLB/NnIy0SLxRIURGbAOlqdTISnCirkWYHmQDdohG8u3FKckbWbG0SaMqSVbDpf0HqI66QA0osiLm5lIUR1FIBPJs+0c74AWVb+mJJA1UJlGoAkjDW8wT8mMSErTsq3QOaLPWlpeJKlECEEQIIRHUIjiER0IRHV1ECEQIXTIqnjCypleVRCgOf6f7xdASDSVxVhthM8KmGWtgFHezfNxf3EXPAkGqjhcRIyStSuyTxxKQkEoJbAufliMh+GJJOq9I3tBlAEi/JZvGK5Uxr6RZgM5vDeGhY1p4pbE4p7iANAsudTJDi/i5xPvDaWc+gRzSlZMYMw5HY+sXxeJyUxGLc1teyzJFCFKAhqSXIy1nxF0jsquncNZTNbaK4sUCzXdWSxPa4gKgyct933G4hgOBGqpZKWplEkqdRve8IyPDTQTDHPkt5VM6QljaJMcSV17wAtDs/UmX3j3ZJIuyhbSWPk1oXx0AkDfUJ7s7Glua+AtbdZ2lQFpBT3iQEucnULuAbcg9ozML2QaLrykk/ArSm7Zja4N3GizK7tEVkJlSyly5USc2OB5Zf2jTiwXdi3FVN7TEzsrBXmsNcpaphUX16gHTZnBVY2fcPDeYBlDboKDW535jvdacLFp6uo9ahMV4tIa4fCUsD9fOKYXZRkGmt/E6qUwaXZzrV/IaBPSKcpASQ3h8Rt5EfU23aFZp7JcNeA5pqKGhlOnE8lbL4WkMqWRgXPyI539PaKv1h1D2qfcNA8BCVrkd2kkovhJyC4KQTtjT9kQ1FJ3hyg9b18bSjxkZmI11+4vltSxKWgRpJW+pwAOjsT+nnDskshcA3bmk4o4h+/e9lto4bJR8KM75LHkTg2b1hLv3kZnHTrktZ0EMbi2Nutb+t7Wrp/AU1ClMClW6sYFnGMDn1igdoHDtbmN+XXXBQmwrMQ85RXn11xVVR2RlJFpk0kg6WCW6E803DsX/ScXaxfuAK6r1VLuzGDYk31fouOUGLHIyI27vULHIINFeR0LiI6uogQiBCe1FCilViCxEZG6bpafDUFXjVg469f0iBNbKt8ZcFpS0JfUbMN2+zHC94FBVsgY5+bkl0TBqcAu9i/wCkTc8ltIbAxj8wWjTzdSgSb/KKMxApORtDnZrTIXqBAQGu5fpdueT7RW4gHUpgsFfFZ9XJDLVuVKsebxfDIQQPJZmJgbTnHiSq6FNsYOYnO+1VhG0E4tLtCrXBt2nnNLqpJ1TBWkC5huInJmJSOIDQ/IBurkyNKCBd4odJndZV7Ie7jLQl00eXi3vgNlQMKSDar/C5izvVX+nOtKlci48wItjfWqqdES5NUckgsQzglJYnzBzbBPJhHXua6OweNH89cE5hA6N2UjcWPwtGokBOpmtZ9vC+BuW1fd4QjlvLfl8/7HmtkgC6PP5eXsVBMhRuDbB5b5bcX9tmiLpwBlO+/Xrw/tTbD4s/Db363/palJQjU6mP9VsByXa+3s8Zs+Jdk8Gg8tdT5dcky2MOd4tfXgPv0VbXI8OouAkE2tyNiLs2R1xaK8MSH5Ny7rXzXZgCzMbAHLT4eXkud4ncoc2CnALlyXZ35BvbrG/hWta1xA8rCxcS91tF2BtaTlSNZJLO92DbvyhiR4jAIScbS5xLjr+V0VLS2AyQrb6ffWMCSc2daG69KweEc/6WnKRpvpe1gRd7g7cnPrs8IPfel+tcvje6ta3o815XUpVLUEliQGUTb5/N8vBBimsxDbGgvQDVD43GI0aPNctxvhxUSWsxbH3v8o9HhMU0NAB1WNi4nPfZ2WDK4Y8targjAh92Jp4A4pRsFtJO6zFyyMhobDgdkuQRuvAILQrfwq/ymI5281Z3MnJdjUUSZi9SkglKQPqfXIzHnWyZQn3NvZe1ZSjNmzE48x1S851ornZdQVkqO+B+kMnTRcaygtKSXAAiBQQmZEsks5A58hdzEHEKyK82i2V0Dk3wtnf+WwPmG+kZ/wCrAHqPmnnw5yfI/JI9yVEO3iLhNzzd3GbfeIdDw3QDbikHM72rOvJRUlizN6QXpagWgGhompaGAaKC6ymWsyjRV9zfVvE+80yqvuvFmXoNzHDsujcqpRyQYm3SgoE3ZCakSkkC2Q5+XzP6QvI9zSmYY2vAodaKCqQPd8jHoYI8WRtyTJwDS3X1+Cvo0DWEkadQcDIyHLHLKUQ/tHcRIe5zA3R1+Gnx3+qrw7AyQNOhO3Hjr9a+i3pNKNAfLXI+Zvz9YwZsS5spPnx+nt5LYjhtgB5Kr/D9sDUMY58o63G14juR+fkh0HAbKcyk0ixc3ueWc+kDMUXnUUPLiVww5Rp0FVMKdJSwIIYvjo42zc9I6HP71tGq18+vJFNEZ0vh5deayq+iSohWm75ewDhz0a4b7G1g8Y4AsvT08tPjvaysVhgSHV8/PX4clnVdEUzEWYKID2dyQL8uTdI0IcUJYXEnUA/ADgs7EQOinYANCQPiePXBbNFO0u9zqfydiH63EYmJiLxptVeq14pA3Q738E/OqQRcWv8AtCEcJafCU46UHcaJWdNO/neL44/Foq5JRloqibJdnFt/V9uX94aiky8dUrIy1FfDgUm21/284kMaQ+gu/pbbZWRxLhwYgC4FrRp4bFWQ47FI4iGgWjdYU/ga0ALGzEuwbeNSLGMe7IUi+B7BnHkvP8Tm8xF/6OLzUf8A2E3P5JqhVMTTqmqC1gG41aTpICQoFnbZjyjEkI7wM2T7RbSfb4qtHHJZWVGURezEKtyJLP5xYInBoAKocA55cV0FAunnsyULPhDEeMfEVEDIZwOVt4zp+9js2Rv6cK+KdhyGhV7D6k/BaCuDyUmwPwvY2+I8yc2Ho8KMx0zhfnXy8uSafhIga8uvivaWQlAVpA1GwBDuQFcxgg/LkYnNI57gCfDvofP7KuKMMBoanT5K9R0y1PYMS9j4dKm5X1Awt+6UV5D3sfZXXliN+Z9qP3WemSwsdKigqGqxT4yM5uDyu3voiU5vK6046Ws/u2hvI1evDWuvRLz0sRcEFg7F8DpbOPIZhhmrSq5NHDz/AIV2khhzt6xTYNlXGxQV0mVqITzMQAN6K9uV1NIT1Xwd0OiywMPY9D16w0wK2fAjJbN/qubMogkEX3HLzi4uWJ3ZaaK1aOXzxZvMgJ/XPVozMS8nbritXCsAOvXBXVoZOPV/Vw6S5tu29xFGGNyUDpv1qE5iDljs77elex64r1MskJsR4kuGuAFAsb4Jv6tcxa94BNG9DrwuuA8tvwqMpcASK1GnGgePr1a3aRQ0v98/1jz+LBL6WvCRltXkxSBp5qZKzp81RV4A9ncu1y1jtvb+8PMjYxn+o7XkOSXL3F3gHuoVktQTch2uep88+W8dgLXyeEGuuSlLmDK4lYHEq9KFOQlRZmI6vkkgbHGW5R6zs7st8rK1A9ev6WLiZg1wc4Anbbz56jz9U3wyoE4pmKUi2pk7lVvFv77Rn9oYd2EvDtB1qzyBvRWxSNlkEriONDzvdNd2xJJTrVdi4DC2SA+/p5QiXlzQ0A5RppR+hV2UBxdYzH2UpqAMEFhZiMjIYYsVRGNxO4I/noIeBz6ClVS9RcBy4SByI/sPmYjA4MFHzPXupSguNj0V5lEghPxDGzAn5RT3ga4F22vyVoYXNIbuvaqSo4Fgd7Algx8h+nWIQSNbq7cj3rl7okaTtw+vP2SE6QCzepzuxP6xoxyubq7rTZKPY11Adeaxq6n1arkAvbzjXw0uWhyWbiWZ781j/wCGjn8o1/1RWT+mPNb/AA1YEoAgMJfiB8mfytfzEedmjLpBW96fj8LcimAa69qN/n8rm+I8FKFr7tlJQbtfSFXHmOsaEcwcxpdoSPpulqp7hyP12SVPLKSFAkEHIsX6RaaIoqvORWq2VcZmzQApRtYkWfdz1hZmEji/aFccS+QalP8AC6894Naip7OS7OMh/vMUYrDgxENFK3DzESAuK2ZM4qmzJZJALaQz7AKF/L5F4zZYw2Fsg3F38dE1HIXTvjOxqvhqoJowFr+IhkpOp1ah9S63d+vWJ9+4saARep00robKLcO1sjt6oDXW+jul588aSSGdygtzLuBtcJL+tzDEbDYrhV/jzVT5GBpvfWvjvXBISppdKeZDeYNsY3HrDj2aEpKOWi0Ho8PwtSmmfxR0J+hheMU3MVoxi5w0eael8TCahifAQAroWfV9/pF7DQt2iZfOWYjJwT3aHg2plpzu24hnEQ0LaoTQZzazZNPpSxN2P35x52WTM/bZXxR5G0CgmxcDnf5e3OIVlcKPClfq5mqa4fIsd2I6ev6ekL4vEWaHmpQw0LKYJ0/MluZOfvnCm9m+SurYVzVS6ggXy+BkghvQbv0hoRsv7nrc7KkvdSXr+LIp0i3iayBtuXi/DdmyYt55c+fooy4lsLdvZclUdqFTF/xB4ceHaPaYX/xoRwnujTvNYcna2c+IaJVVclakpSlw4uodbtD0PZksLS+Z9VwBS8mLY9wa0X6q+jlFNgSCkuPX7F4Q7QlZI+6sHRJRsc1xF6grfoluC/L5uPv1jz04ojKtqA2DmTsu18fpz/WFnaik03Q2p0RK1KOwb3JAFvJx6xRiC2NoHVf3SuhaXElKVqik6FPy/uIaiDXjOFBzXNNFMcOoSoEkOIpxWKbH4b1Uo4S/U7JqqAQNITdVgH6Mb/eYUgJmdmLtBrf00VktRtyganSv5XPzQSbDL/Jv3j0LMobZ4LHcHONBZ3er/wDKV7H9o0+7Z/3Cyu+k/wDjPXsseRUTJZsXDKSQbgjkR1baKyGn5FXW4C/ULqOE8SFQwxNsc/EEq1sLdB8Ra+LPGZPH3Op/aPlYq/6FrRhd3237jXuAbpK8Xpk6xpABUlKmGQ6U2tYCxL7knpDGDJMZzXoSPmefFJ4umygN3IB+Q004LCSyXOHNobJsKLRTj5okVB1pCdyPrEXM0KsBAcF1fEeKGVM+AAtYl9nHw83dn29XyIcKJI6LrF9a8vun5Jy195aPXDmPoo0vEVTAQSHLs+HILAjzY+/OOSYZkfiAPD134dfRDZ3yeGxZvfbb8/fms2tn6l2PhSyU+Qt9+cacEeRmo1Op9VjYmbvJaadBoPQKtRLscDPlFgF7cVDxF1HYLN4rxRZJZRAYBn+ZhnD4ZrRstbM4us6aV19FkUM2dOnploWoEmxBNmuTaHZGsawkjRWwAyS5V9m7PcUWiVKlTwLJAKifEOqjgtZ2xzO+WzFMzZCNOC33YIiPMN+S3qnhSFXIBiUnZ8bjZCSzKk8Il7oH0iA7Oh/6oDiES+FJGE/M/vC8vZMD92hTbIWr2bwgK2byJ/eKv/TRgeELpkzbr5vxrtCZc6ahAulSkP5KIz6RrYP/AMZje0OftusiftYxOc1g1XLVVctZJJz9I9JFgIov2hY78XK8USraSgKg5dgCSwfy9zaJyYlsZDQpNw9tzFavCKPULBrfW30HzjD7Wx5jACZwUIczNS26im0qTpP8rHzSkNvva3KPLMmL2uzc/qU5LDle3Ly+dffkrJKLsB6ee0Re4VZUmt1oJ7uFLCQmz7nYDJ+UJvmZGC48PryTrIi+gOKZnzxJSES88z13PX9oz2sdiHF8my2MNhm8Nh81kzZu5PvGlFETTWhWYqWKJpzUtHg1QJiHyxYNjdrNYuCXvFPaWHfBIAR1paw8JiWYhpeza9FXPr5afCSVKDgaWJAx8WHb18oizDyVnboN9dj7LvfMzZDqdtPys2pqQElSQzDwgqA9B8zvdofwjnTSd27bia6/pVYtrYIzINxsNln/AP5AfyD3/tGv/wCpb/3WL/7x3/QfH+Egqm1AENd3HIjn0aOFwaSOC4y3sBO/4/KTmS1oAmIBBSQxGQbseeB8otaWv8B4qNua3PyXUUy5M1KSAdelLsHZiSwfACiMcmu9s9zponuJIrU0eOw4enxTze5laCBrpt7rN4/wkIGtN0XO4bc5yL7cjyJi3D4guOVwo9fhcnhEYzN1CxpXF1pQEJSlgXBKQS7W9uZ6w13Qsus66KnP4cp4aqKq1UxWpanPOOCNrBTQjO5xzErRpVeHVs3nEAwuNBRc4BhLlGbLIUw+9/2hpgBas+XDvbKGt4ryeFqBYEsL+X392ga1rSCrsMx75S13DfiK9uSwOITnLMXAvDrBS2hVgLquw3ZmoQtNQpChqCvCQdWk2DjZ835DnZTGSF7TG0WtXAYdsbhK4gL6NT8E1MZtgC7PloShwZu36BPzYwUQxdAZ45xq52rKUDVJjneBdAVP44RW6doUsqmisBiBxTAgNK+QcZ4Z3lTNWnClrU3mok+sa0XaTY4gCsWbAiSYkKmXwhKfEWAHP7tFEnaxINLhwccPicfitipokpQAUp0pck3y2Xd8dPTc+eZj5Hyl+YgnYfx/KYljZlGZoIHXP7KdHICCCAoE4Fmax0hrO9veKMViXyA3Rbz4+p4qyJrRzB5aVXIVp8U4LXIYkuQQ7dGBI1NCD3Da9ByvX+E5BhpZRbBret1p81IMXALX3tu4v/ze8ViSiCR11Svm7NnA58dOvVagOpLE3YamB+XttGaAWvzAem3WqnXhynfismtPjJy9x5bQ9h2+CuS02zNbC3LxWNXlSlaAGc/fpHpOzI2NHeHdeJ7dmmlk7gCh1XsmBOVpKEnSjHVTP8sxVjXMdINLI18halhI392ReVuw5mkSJDlkhzGLiZu8NA6fJbWHw7YRdaquvUxSgJJJvqPwPfH5rX+2jSwEQjjdI9wrlx/hZePmMsjYmN1PE7fyrO/R/wD0j2H7R3vW/wDxn4/yr/0k/wD3+SxvwC0TSlUzulJPxF23Ygv06e8NCZskeZgzA8FlCLI4h3hI0U686JakqmCYSbFKdOoEDJIci6onhjmdmDa049eiMVo0tv4cetVDhFYlDasHwuLAOwu4Oz++2Y7NET9fgoYeYNAA9Piug4okBI1l0qe50ENc7hr7D+kOIz8IcxI2Pv5fS9StPEANAJ29uteC5OsppY1FCsbEgn9I1gNBe6RcwGy3YdfylqSj1t4hlm3jhXY483XXQWjVqXLGlKPA1zc5f2OPYRwUTYPVDr3UJm0Mrhpx+J+f4SxnLLq1G+8cvSlwA3mBTlBXqlkaWI5EfZiiQZhqm8K7uf2jRdRL4hTytKtKNdibAl25tnrHYu8c4O3CdnxuHhGXS/ponKftSpZxaJYud7B4VTh8YJDomDxhZ3HUZ/aMmTFT78Oa0o3tdpxVRrJih8bZ6QocVOHU5xVxDasDr+VCRPXutTecE2Km2DihgFXSlLmKclyfUv63+cVPmkyg5j5obZcQR6KNPUquQpTDe/3mB0kl5c2/mukjLmCSWoJExQAsLFYO6hkEW3sHe2MQ+HyOcxjideXosoyBrZHtG3O+J8/ol5S+9lasN8QZwWILhO/Nvq8WPBhly3d7cx5Wl2zHEwZyKrflpxpeyZK0JAQyiCcJ5vj/AE3FnZgRkxx74y4mTT35devFEbZGtAj8Xtz5Dl8uG6ZEohwoEn8zONvCXU7szk2LDML96x7g5ugHDj67fz6JxsT2gtIJJ3PD03+N7+aoQkpA1Bi3N+md3Z/XbEWTZXuJYbHX5Wj2ZKYY8rxR6H2tTEKlpW82Vp4q6RWBBGo+HG9vJo5+lkmvuxqkMc/DMbnfofLj8EpxScVLCr6CPBazWFuV/rG1gImRRGIVmH7vVeQxMzpJBJfhO3L+F7LlOEBjqUDjJYlmixsojMh4D4DTVXSMMoZe5HyBKel8FCR413/KLD3Y26tHn5+0HTmmg5efM8/44LTiw4iFnf6DkmF0oSRpYAP6vh+e3P8ASKYpPCQeP2UpWkuHW6yOJS3GMG2zA5tsLD2h9zyGaHTj7eaohAMluG23vyCwv8JP5kw334TGqvEzWdR8RDKLOGub42ywfyhpgy6bBYuKDcuYC6I5hJcUQClJBJS1jv8Aelj6wzE4gpF2VzdNkhKLe0XON6qtjMhW9Rz+8RoWXYXSW2YC4vsOeBCT2ZHZm7+6fw7u8aWu29tFzNfTaVNtsYcBVLmOYaPx5qfD5hlzAqyhgjmDmISC20FZC4NfZFrWq5C0h0TCqUrD+Juhfyz+sU4ebXanBTx0G1G2HZQRMAAC0uNyM/OLHuLnWlog1oa12w5LSp5SAy0AHxerFwfJrQs51ktKYNinM2v3G+/xCqrJKlKLAm7HzHIZaLoZGtbVpDFxSSyFwBPDy05KUk6Gsx2tEX+NSgY8Gg1NyZ6nBHnfoLeV+cKPa0+ErZihdE0yE6/ILZo7oCidrj0s74LNGNiHf6hAHXNacLdBZ65KVOpw4Plv97RB4o0Qpk2LCsQoAuqzB8PYfryipzSR4dbPX8rmYNNHShf8KaUhmFuVukRzkuLj5KTgAAB5papkBSVS1KIfS7ZF1He2AdhDcMr43iRgsC9/YdapLEQslDonmrrb3Ppw5IlyUoDWASwLnDdWDvkh2MSfJI91g2Trt/JquHFRjiiY3KR4W6b/AHoE2d+CuCAbE5cEbHZvV/2ioFzbdlvz5f1/asdkeQAaHLgf7WfLlq1LBYX8Jxptl7a2BJ6EEAxpl7RE1zddNfPyrhZ+O5CzmNd3rmu010PLzvjQ+GwKmtOsiw6KJ3clKcX8LHL3ivSEE6+g5ULPxvhWibzOfW3qfeh8K89VPuZeE6lkZAO7jblFIfOdXU0eavkkA0BJd5JPii0uAlsbbOTu5fAja7MjcyN2fe/pXosrtCV0z20bofU+SVlBaklILsXSGxsw+sXzPiikDyKzafypYXByvicM15dRp8k2i/iBJSEsFeQ8X1aMvEZv8XFxv56LVwJiLDKdmih9z15pcTnLhx5Q0zspmWnE2kZu1S55LQKTH+IKCcuQctyf3zGZisE7DuAJu01hZ2TgkBermavFsfu5i+KsiWxObPlCr0j8494utnJQ7ufzWNQTFSFouDcjnh3STbZRD7ekMSsErHAqhrsoGvH165K2ppEaCETNSgf8sjxPd2AcMxZugPSJfqHF+rKFb9dcEvHhWsblz3XDj1STp5SQFodKZiS41MCdlJfcuzDz6xY55sO1o9WoRx6Eb68V6ozJK3ZiQCxYsNseT3joLJBop06M+aXmTidWoJvc2zmLMo4Ljp5DoUilO4eOlRXTcAWCgpN2ONmI/tGbirY8ELXwX+pGWHh9/wClOp4WkpOnU42z15QMxPiAdVKjEYLIzMyyVfw7h/dv4iQFXGLuU29ucVzTZhVb/i1CGKjmHD81/KPxACym7CwVuS4yPv8ASJ92cmcb70qf1Q7zujttfn11WiYVSlwL/uOmT+nLEVd+AC4J5sQvK4efn0K3V0qhCWHIX53v974hN+JvUHVONjvQjwn+KT/4fwMmz/t+0Id8DJbtkw2OhorKKQEpy9/Ztn3vEMVMZHWBWnRXIGZQbN2eglpjMgKJfUWu979NgGF8tDbNyWjSh8P5+iTkGUNzb2fjry5D5pmWDpGosQLm4GL748/0hNzm967KE5R7oZjtuqEhRC0uxYsogjS1s6iVMSo3PJ2s7T8rHMeBpxHP5Cr0CTbne1zCda0NbV7m61O6Qm1CVnuiHb4NWFMH1EjD3YMRZNhD8cDogZRx3rhfDXl7cUhNOyc9yRdbXs6hvpz4b8FVJlrBZbKSywfh1KAHh0kK1G+5NukMnu3jwaO050L3uxXwCXjEjdHgEUeVkDaiDfxKbpJSZni1NYFt0tpPiJNzb4ugdtN6MRK6FuSr+++w+x4bb6OYeMTHNdfb1PXntrTUITrZI8IvvdSrlV/T22iMckmXNIfEdPQDYJ3D4djpAQ3wDnxJ4qupcJURli0TwxuVoO1p7tCGoHPA1rT8rOpUeFXMAEtyDvbpG5LLT2DgbHuvLwRMbE8k+IUfWrv4KmZXFAJTuGe7jqG3/eJyYZshGfgoPxb8haw1a2qZaO6SlJBDEON3d+WXwcPjaMDEZxiC872D8Nlv4TDl2GyaAH+buljOZZKCflY/d/nHpYZGysDugvLzRmF5Ydvqp00wkB2brkwn2hGHUALIV2CxEgflvK06Xx0TappI/aMSRjxbS4LbjMbXNcGk7m1X+BH5YnrzCt7zyKo/E69CQhwUqw7pbyubw21mS3XqCPdZjiDTK0N7cKSNSQGUlWlScWLkdCOnNmZugYZexGhVNDhpS9lcHMxIX3iE6saj8R3HRXSIvxQYcuUn0XWROcN0rU8MmySNdhsD72OPTrFsc7JR4Darka5n7hS8kSSSFBJIe7Bx5RJ7gNLXGAu1pbCOBSyb6g+GP9jCL8W4DQLQGFaas9eqYmVSKZICZamO+xP9R39IoMTsQ6y7brZMxYlkEdNb16pMcdW7hAHVyYu/Qt5lUu7Ref8AiEzT8fSSBMRpf+YXAL5bYjneKn4Fwb4DarOKa53ibQWuiW90hx8Ti/k3MkAc7t1hVzzWu+1dclNjAD5b31zATKQLANp1WycEjAswLXxvCxPG9evfX4pgGwANr8/tp9uKjU+AixcnSkAW1MfE2wuRuBaOx+NpNihqTxpckd3bhobOgHDr4haE6YxA9/nf3jNijzMc/r0T75Mrg0+6iuXcFyG2GDnPvtfHWJCTwkEann18Fws8QIOg5KK5aeTvf2uD1wPlA2R7RqdtPyF0sY7Yb6/g/FRVUJCSCQNIv0DP9POOthe57SB+7rrZcfI1jHC/2qsTUrBUCpQLJIbDXI+HfB22tF5ZIx4Y6hWv44+4S4fHJGXtsg6fnh7H4KCJCSxMoORnf4mYYItcYzFrpZGkjPoPhtv77FVthjc0O7vWvff7bhK8VQAmzliRl7Hmdz4erX9HcI97j4vX39OG/uk8UxoAI9OueyyULYg8jD5FikmDRTaJz9LYckvbc5yb/wCl94SlaBseuvqtrBSytoEaVz+vXDzStZW6SbhgLjzh/CYRj4w4jW1DH9pPbKWtNNA1HqkOG16UqW/wqSR/ZubPmNDHYUyRtA3BBXnsJiGslc4gUQR5JSnlLWCUh2zzPQRdNKxhAcd1zBZnasG3x9FSitUgumx5c+hjpwzHjxf0pux77Ibpr8fVbInInU5W7FDva4LfD5Hn/cRmMbLhsRl3B6tPyPhngzgUR1X4VdNMEwCzAdcevOLsRN+ma5124/P+FVDBHig0VQ+ibMeac4uJceK9Exga0Dkke4H5lf8ANGjm8gqNU3KozMT4AWSMag9+RZjc/SLXTBjrfx8tOtFnZXVQ66tYc+Uys/N7cns7RoNNpIlakumKqSakhyFCYnG1ldfh9LZw6cj8uJab3FfhXssxke6v4TrmU7TXISrwFV/DyvkAixNhjyhLkjnzM3O9c10sfJEb4a69bfRR/HIlFQlocKUSD8IbyZz6tHXQPkouNaUuQTNhLhVgm0VnESgo8OQ5BPtdrbxXHh8+aztpa0JMXkDaboRdKM7jLqYoQtJHJldQrILeWCIm3CEDQkH5eyV/VNEh8IIPx91SmkRM/wAssT/IrnyB3i3vHMHj18x91AxRyH/TPsfsVE8KmEtoL+n1jn6qKrtcOEmOmUrouB0JlJCVBWq/IgA5Av0B9bbxlYycSOtpHD5c/om8PFlGo11+fL6rR0jIPhPLl6PYXswcsH2hIuJ0I1HXl9TW6Yygag6Hrra14mbdSh8ILAObMWI0sGO73ydmiLow4NjO+9+1jVSDyC6QbbV70dPv5q6YHJY4Fw4ubliDsQPn5tXCaYARv19VObVxrh6fMKNOoljqfY2IxixLiwP3mczW1VKED3Xd/JRp1O6HUopY6lbgnVkWx8miMzcpElAA2KHMCr181KBxeDHZJBBs8QTfyCrWkTNSWsQQT0unLc3548osswZH3qK66pcBE+dnA2Pslh/DEtJJKk6jfJc73uGcY3BzDTy15e8DQ0NPT5a6/lKxROYI4yfELOu51+en50SlTxVYDu5clIPm92AwzPmL4sKwuIA04/Dh+NlGfEOYwOJt3C/v1aXk9pi7Llg7OknywXe3WL5OyPDbHkceqpZ8XbZz5ZGXw0/lJz5ZCgpKfA5YGxB6g+cNscC3KTqoOwsoeHtb4d+XxtTVMDajtCww7nvyMWn+sZEzPJx4eiy62aFkEPi4PP3jewcJhjyEg+a89jcU3ES56IXlLMCchxdxziOJa54IaaPNM4PKwC22PPzWjRKGgAHz8ztb0EIYgO7yymomDJTVVV0MuYHPhP5se77ecThxD2GhqqpMOX6HhyWVIkFOuWlaVCYUgFNxYuSW5D6w++QOIeRWW/mEu1hY0t/7Vr7roJUpCUgCwGNtmvjPXc+UYGIklc7vA2z1Q9FuQxRiPuzoB1fr5qRHKMwuL3WVoRsbG0Nbss3uZ/P79o1fByVWZP8ABK1AWVEgI0kLu2z45ltswYqGQtpup4JISx5b2CZXxOnTNTLkgzAqxSBYkjOpQckdABFbYJ3Rl0pykcfL0GioMkbXDuwSOXP46rR4kuaUJTKCruCSoOBcMRtb9rXhbD91nLpSLG2mnx4q6XvMgDAflajITolgzFALAb4hYagEg3NncYLbtFjz3kngFj33rrj6KMREbLe6j68L0H1XOVdSQo5SQcFCXBw1hfzjSiZbefuUvK8B9t09gl63vCQVvhgWa2RjMTiEYsMXJXSOpz/RVSZdwYtOgSwJtNrlFCmUGI9jyI6RW17Xi2q+SN0bqctGg4ncIW+bK3fkeYhHEYXTOweyfwuPI8Eh05rpZSmFy928jhrXyD8xGI8OJ00+/wAetk2xzQNdft5KvvAzFLNZILAkWwA5Aci56RMsN2w+vl9NVXnFU4enM/XRWypRDh7u4uME/sMENnN4pkkBp3sev5V7GEW3bjw2Xqy6QSADfzCgCzc9+l4jGA2QtabGnpR3vlw80SHMwOcKOvx4Vz4ryUzjYOANQIzsHFwR7c8RbJ+08T5G/wCqVMf7hy8x1YK9lpBmagLablxkqwwOwGfLlFMriIsrjx5eW9+dq+IAy20aVvfG9tOVKpEsI3uVOSBdRAa+eWzY97HSmX9o0qteHp/NqLIhHudSb046cegvJq0kh9OLOMev7RxrXMZQvfXX7K5wDnB2m3L7/hZNahOt9IIHU/YjRwr35MoNWlsRDFedwshYCqhQOpISh7WAb5vHqXQsbCGkk1S8dHJNJKTE0C72AqvdWJUoE6lH1w77dIQkAqmBakRLNJXXVHW9zw5aK5Z8JuTC+HDu+T+KI7jTWhaQljWX2GI2Hv7sUFgRsMr8x2CY/B6gC+Xfo0Zz8b3ZdY0Fe9rajwucNo738khW0i5ZCvYg/Zh3C4uOcUPgs3H4aSB4cdjxCSUsrUNajcgEk4EPBoY3whKh5cdSnKCoQJhLkgeCWGuxJL/3zeFZ43lle5TbJQXCvIALdQsKHNj9POMSaMgGjVrUweIBPOtFJYs/36xmOYxpoG/otdrnHcUs38d/6SfnD/d+agl6daCpKTJVMTeyQxJIOCA/+0aDw6ic1eqw2ub/ANb62W/N7PaECbT65a0i4UQ//MCQDb1cY3zWY0Pf3ctOaeI/HWxTBgc1uZltI63SMrik1BIXk2Lp0qs4DsGdPvZob/SxOAI29dOilDO9pIJonjXWy0p/EEdwTcn4S4vryTnJe3qYXjhcJ6Jrj7clZIQYaG+x9eJXPLrNZDgBgw5s5zz/AGaNEMq0u3RoHJbHCQFSymYNSTdPRyQdwWcDDtm0IYkOa4SMNHj5p7DESHunix9P7Xo4MoKLXGzB1EeQjgx7C0Xv8kw7sx7Xk34R8Vrz+Fah4g56ZFv3f5QjHiSw+EpyWOKUU4eixp3DVC6b+diOhe0aTMYw6O0KzJezpG6s1HwW1KkqUlgdKiGKuT6X+Qz5Rml7WyWRY5JuWF7owAadz+C2KWiSw1Mosx2HoOXrFeYX4VYyIUM2pRWyxYBgL7bnoLRTKao0rculA0EtKnFQUA1rB/L+cbF3tyHsvNE1jmu4Hevt1uiGVzw5o3G1/frZKUtYCVnkxUkp8SSCX8QHiHLJhybDuDWgab0b0Om1cDz4JODEB7nE8KsVqKO98Ry4q/vQCblm/UkBtjdoULXPptap9uVgc+9EpWTyxBZthclQ08hfLexh7DQCxxPwo356e6TxEjnMNCgPU2K8td+Cx6ji3iDBgB/s3yjVHZLidUsO1GRw3Wo+HkqF1KlBRezHGP35+0Mw4WNsrbGtpObFvfhiSdSPqfws7SbcyPYf3YxsWHH0WI0vibQ4/T+VfPm+AWdre0ZTYv8AWJ2vVaU2IvDgHXh16JaTWEWOIZkw4Ord0nDjHs0Oy8Wkp8Yx0iIeHeF2646ORn+o3Y8lfLmKR4sjnt5QpLGyXwFasEz4x3ihUr7y74wHxFmFYIAGt9yqcW84ol7j6DrmquI0aUSkuPG7E+bm/wBIbw87pJTrolpYe6jF7qrg9P4itn07PfGeXKzh3zaJ4uUBuTmrcJA13ikOi2EKZiQUtbxMMnGT9iMt+raC1G0NGa9eitnqVZvcFoWw8TBY+qumlcWg2vfxf+oe4hnTkq8zuZXi5Ip/4iFpUGIQUsfEdrOzAk36bXPI6xPheNb1B5fylMXMcO249uB5n+Fr8KWvSNRdSnmdHU+l2Ds2o+4uLRn4xrQ4gaN/b8N/nQVmDc/KC7V37vLXbby1VfEUy1o1EocCxdx/SCkl1e7OM2MSw2djsguutdeClPlezNYv4j004qmgRKKShAGo5cZD/wDvYYBaLZzI05nHw+XWnmoQBuTK39x59a1w2ViuCSjq/hh3fJDizjLDLj0ik4uShTtDp+Dz9U02BtnMNd/biOXokRxFKLd0pJSWNw4zYcrtvzhg4d7xdij1a43ENifeU2NOHw8lpJ4pKUpHdqAL3Cgxd7AbPa/TeEo8JI1ru9Hw+6vxOM7x7ch0+ft91o/isvFXdbUpCS7VVYQzpzv16+cQYC51OTbJaFKFNUM5xz2vEnsNrjyNwmZFd4m+QgyU2yqs+tKydNUTqDW533FwXtYH5crwMYcNVzM67HXX4SGvT8RSCMhIZLgAA8xYjObdIuyZwQLrz34+26oYctE1Y5bWK99l7LmhzgE7tc8ts5z1inu3ObRsgcL6+SZlLWu8NAu411r6pRVbqWoAEMHvtizc7wxFhS3RxRJODFnGx+/3WZU1Ci6tTEBuRtsG2JPs8auHjGwCz5XU4AO0I3661WZNU29zmNiMAN0WFj5nF2VLoJe0ddRSDcx2T8oeHUWAVj7MK5qOUcE+1orMa10rlS0DISmWQWYgvzv6ejX9IS78ul06pauTJDTttfPfrbVc1MBBDux3+UaAdYWJJGLsbJuims6dXUEu3laKJGAnMQr4J6HdtdXmVaiZpQQwKS+GsfIxB8Yc8O4q2OR8cLgdW9daKqWgp8SPPpEneIZXeivw7WjxN9VLitbrSkAMMnz5ffODAQGImzfJHaEve1lHqpcHkF1KPwi3K+QzkOzc94uxjxQbxKowLXscZBttw+9Bagk2G43xYfqMW+sZ2eitUsEjQ8aHfyvn90vMXpBSCL2SDzOBFgjDiDySzppBbXb/AJSWup/L8k/vDdYfmkbm5D5LSXw2bKV40nR/MfiS4DhXoXyA+GvGbFjIZL7s68tj6LVmwsgFPGnx9+vRXrm96gyjpTpbYhgkNqsWL3sBZxmOMb3b+83v78PKuZSc4dIwxnQDy5cfO+QSS1JLMXDC2GURdh5vDdO/5BURlpHhN/Y8VKnWoKCknSRvyGORe0Qe1rmlrhYUw4tOZpopniClomJIUokgFyANy1thbHnFEDWPjIyirpXSyOY8akmgbP4Vk6YicR3idK+ad/T9PbNqWMfB+w2PPgtMFmJb4xTuY4pQUBClN4mNlDfkR9Yt74Ea6eSiIQN9U4mqUzKABw+DFPd2dFa4NaPEVcoqBsq2T5Yz7xW5gykkK2AZnhrTwtWqUCCPpFIBtPvAogpZR0glNzu5Yhs7sQ4tv5w4GcD1awS/Uvvn7V8q89wtWgrBo8SnflzhWdhD6Cbwx7xmYahZnaKqLDukOQcqxyDNfJxF2DgBsuKnJJRGbrz8lRJWpJ1zFAEpwCbl7MNhE5Y+DBoFOJwIqzfmoS/jdLeRw3+0dAN0VS+xAMgAo+26KiagE3+/TrExG91Bu6jFKGtc5+o4fDULNqJ8tR+A9WLfUH7MasbJGjU/JYE0kcpPh6/j6JNU5Luh0tvu/Q7QyGmtRaRc+j4BSgAXve/945Q1KrNk2VYqoJs7j7+/SKDGBqp986qJ0UppCiRt545QBtBddJb7Gx4cEpOVpf7+xE2tvQqYYXahU/iQoMPC2b5i0RkOsq9wYIwK8SuoZxXMQkGw26DJgkjyMJIXWOeCPJXiSozinmcl2+xe/SKzIxsV8k46J7pDyOvlS6dNIlKAhJszXbLO55KvnqM2jG757n53Jx+Hj7vIK6HyP8JWvUEIKSrS48LB1MXyDdxa9rmLofG/M0XW/JKvIiblcavbSz8PusWklssFySLajt5Xz1MaEptpFUkmS3Wuv0Wr+IR+dfy/aEcr+QVvfRf910NB/lTfMfWMXFf7iJbuE/xyey5GX/meh/8AiMbbdh1xWRNs70//ACpV3+VL8v8AvmxYP8juuASuF/xj0/8A0U8v4DEG/uUJ/wBpT/G/il+a/wDqhHBf8/b6LRxW7PQ/ZJTMffWLjum4P2DrgVs8O+CX5n6xmy7lOnglO0f8v9B+ohvAbFZ3aX+NWTdvKKnftPqn4f3D0+6WV8J8j9DEY9wn8VsfQq/+VX3tF/8AyCyXf4/h9FCT8Hp+pjkv+Uq3Bf7ZnuqqvbyT9Ivg2UJ/8h9CkOKfFF//ABKnB+8eiij4/wDh/wC2K2bqGK/2x65qFT8R/pP0VE4v3hVO/wBk/wD/AK+qVqMGNCP9yxsR/iSBhtqzUz/KjyP1VFJ/c72+yYm/xx+/1VcjMQm2VMf7grZ3x+kRGyHcfVR49k+kRg4Lai+yyZmEw2zcpZ/D3+qrov8AMT5xfN/jPouxfuC6mT/nSP8Aj+secd+yX1H2W4f8jPQ/RdIjA+94Sdv8fupM/wAfwSPGPjP9I/SHMF+weqzMd/k9mrmpeI1XfuK89xVkQUF//9k=",
      description: "Tác phẩm văn học đầy cảm xúc về tuổi thơ và tình bạn.",
    },
    {
      id: 3,
      title: "Đắc Nhân Tâm",
      author: "Dale Carnegie",
      narrator: "Nguyễn Minh Hoàng",
      category: "Tâm lý học",
      rating: 4.8,
      reviews: 1205,
      price: 89000,
      duration: "7h 30m",
      chapters: 18,
      image:
        "https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcT5IqSs9SV7eTNQiNZSXsScSZXlw04fmXrMroTGQ6Q-bObZ_ZK_EBsPSrQzXXTklzyOi1JblhROK86yhNtJNJk6NG_rd41i7v-r4KhnSY2kuFSb0D3XZtcM&usqp=CAc",
      description:
        "Cuốn sách kinh điển về nghệ thuật giao tiếp và ảnh hưởng đến người khác.",
    },
  ];

  // Lọc theo category và duration
  const filteredAudiobooks = audiobooks.filter((book) => {
    if (selectedCategory !== "Tất cả" && book.category !== selectedCategory)
      return false;

    if (selectedDuration !== "Tất cả") {
      const duration = parseFloat(book.duration);
      switch (selectedDuration) {
        case "Dưới 3 giờ":
          if (duration >= 3) return false;
          break;
        case "3-6 giờ":
          if (duration < 3 || duration > 6) return false;
          break;
        case "6-10 giờ":
          if (duration < 6 || duration > 10) return false;
          break;
        case "10-15 giờ":
          if (duration < 10 || duration > 15) return false;
          break;
        case "Trên 15 giờ":
          if (duration <= 15) return false;
          break;
        default:
          break;
      }
    }
    return true;
  });

  // Tính số trang
  const totalPages = Math.ceil(filteredAudiobooks.length / itemsPerPage);

  // Lấy danh sách theo trang
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentBooks = filteredAudiobooks.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <p className="text-gray-400">
          Hiển thị {filteredAudiobooks.length} sách nói
        </p>
        <div className="flex space-x-2">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-md transition-colors ${
              viewMode === "grid"
                ? "bg-gray-700 text-white"
                : "bg-gray-800 text-gray-400 hover:text-white"
            }`}
          >
            <RiGridLine className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-md transition-colors ${
              viewMode === "list"
                ? "bg-gray-700 text-white"
                : "bg-gray-800 text-gray-400 hover:text-white"
            }`}
          >
            <RiListCheck className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Grid/List */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {currentBooks.map((book) => (
            <AudiobookCard key={book.id} book={book} />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {currentBooks.map((book) => (
            <AudiobookRow key={book.id} book={book} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {filteredAudiobooks.length === 0 && (
        <div className="text-center py-12">
          <RiHeadphoneLine className="text-6xl text-gray-600 mb-4 mx-auto" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">
            Không tìm thấy sách nói
          </h3>
          <p className="text-gray-500">Hãy thử thay đổi bộ lọc của bạn</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6 space-x-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={`px-3 py-1 rounded ${
              currentPage === 1
                ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                : "bg-gray-700 text-white hover:bg-gray-600"
            }`}
          >
            Trang trước
          </button>

          {Array.from({ length: totalPages }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentPage(index + 1)}
              className={`px-3 py-1 rounded ${
                currentPage === index + 1
                  ? "bg-orange-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              {index + 1}
            </button>
          ))}

          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className={`px-3 py-1 rounded ${
              currentPage === totalPages
                ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                : "bg-gray-700 text-white hover:bg-gray-600"
            }`}
          >
            Trang sau
          </button>
        </div>
      )}
    </div>
  );
}

// 👉 Card cho chế độ Grid
function AudiobookCard({ book }) {
  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-750 transition-colors group cursor-pointer">
      <Link to={`/player/${book.id}`} className="block">
        <div className="relative">
          <img
            src={book.image}
            alt={book.title}
            className="w-full h-64 object-cover object-top group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-3 right-3">
            <span className="bg-green-600 text-xs px-2 py-1 rounded-full flex items-center space-x-1">
              <RiHeadphoneLine className="w-3 h-3" />
              <span>Audio</span>
            </span>
          </div>
          <div className="absolute bottom-3 left-3">
            <div className="bg-black/70 text-white text-xs px-2 py-1 rounded-full flex items-center space-x-1">
              <RiTimeLine className="w-3 h-3" />
              <span>{book.duration}</span>
            </div>
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-1 group-hover:text-orange-400 transition-colors line-clamp-2">
            {book.title}
          </h3>
          <p className="text-gray-400 text-sm mb-1">bởi {book.author}</p>
          <p className="text-gray-500 text-xs mb-2">Người kể: {book.narrator}</p>
          <Rating rating={book.rating} reviews={book.reviews} />
          <p className="text-gray-300 text-sm mb-3 line-clamp-2">
            {book.description}
          </p>
          <BookFooter book={book} />
        </div>
      </Link>
    </div>
  );
}

// 👉 Row cho chế độ List
function AudiobookRow({ book }) {
  return (
    <div className="flex bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-750 transition-colors group cursor-pointer">
      <img
        src={book.image}
        alt={book.title}
        className="w-32 h-32 object-cover object-top"
      />
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-lg mb-1 group-hover:text-orange-400 transition-colors line-clamp-1">
          {book.title}
        </h3>
        <p className="text-gray-400 text-sm mb-1">bởi {book.author}</p>
        <p className="text-gray-500 text-xs mb-2">Người kể: {book.narrator}</p>
        <Rating rating={book.rating} reviews={book.reviews} />
        <div className="mt-auto">
          <BookFooter book={book} />
        </div>
      </div>
    </div>
  );
}

// 👉 Component con: Rating (hiển thị 1 icon + số điểm)
function Rating({ rating, reviews }) {
  return (
    <div className="flex items-center space-x-2 mb-2">
      <RiStarFill className="text-yellow-400 text-sm" />
      <span className="text-sm text-gray-400">
        {rating.toFixed(1)} ({reviews})
      </span>
    </div>
  );
}

// 👉 Component con: Footer (giá + actions)
function BookFooter({ book }) {
  const [isFavorite, setIsFavorite] = useState(false); // 👉 state toggle

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-col">
        <span className="text-orange-400 font-semibold">
          {book.price.toLocaleString()}đ
        </span>
        <span className="text-xs text-gray-400">{book.chapters} chương</span>
      </div>
      <div className="flex space-x-2">
        {/* Nút Play */}
        <button className="text-orange-400 hover:text-orange-300 transition-colors">
          <RiPlayCircleLine className="w-5 h-5" />
        </button>

        {/* Nút Favorite */}
        <button
          onClick={(e) => {
            e.preventDefault(); // tránh ảnh hưởng Link bên ngoài
            setIsFavorite(!isFavorite);
          }}
          className={`transition-colors ${
            isFavorite ? "text-red-500" : "text-orange-400 hover:text-orange-300"
          }`}
        >
          {isFavorite ? (
            <RiHeartFill className="w-5 h-5" />
          ) : (
            <RiHeartLine className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  );
}
